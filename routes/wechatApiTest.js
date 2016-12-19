var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var qstring         =require('querystring');
var request=        require('request');
var myLogger       = require('../logging/contextLogger')("menu");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var platformConfig=require('../config/platformConfig.json')[node_env];
var router              = express.Router();
var WechatAPI = require('wechat-api');
var wechatApiService        =require('../service/wechatApiService');

router.get('/createmenu',function(req,res) {
    var usercode=req.session.usercode;
    wechatApiService.getUser(usercode,function(err,msg){
        if(!err&&msg){
            if(msg.appid&&msg.appsecret){
                var appid=msg.appid;
                var appsecret=msg.appsecret;
                var menu={
                    "button":[
                        {
                            "name":"优惠活动",
                            "sub_button":[
                                {
                                    "type":"view",
                                    "name":"本周优惠",
                                    "url":"http://www.taobao.com/"
                                },
                                {
                                    "type":"view",
                                    "name":"最新优惠",
                                    "url":"http://www.taobao.com/"
                                }
                            ]
                        },
                        {
                            "name":"菜单",
                            "sub_button":[
                                {
                                    "type":"view",
                                    "name":"个人优惠券",
                                    "url":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5c30177c4f734b4c&redirect_uri=http://16fe012909.iok.la/personalCoupon/getMainPersonalCoupon&response_type=code&scope=snsapi_userinfo&state=4483NMAPYXWM3764#wechat_redirect"
                                }]
                        }
                    ]
                };
                var api = new WechatAPI(appid, appsecret, function (callback) {
                    // 传入一个获取全局token的方法
                    fs.readFile('access_token.txt', 'utf8', function (err, txt) {
                        if (err) {return callback(err);}
                        console.log("access_token"+txt);
                        if(txt==null||txt==''){
                            wechatApiService.getAccessToken(appid,appsecret,function(err,msg){
                                if(!err&&msg){
                                    fs.writeFile('access_token.txt', msg, callback);
                                    console.log(msg);
                                    callback(null, msg);
                                }else{
                                    if(!err&&!msg){
                                        callback(null);
                                    }else{
                                        return callback(err);
                                    }
                                }
                            })
                        }else{
                            callback(null, JSON.parse(txt));
                        }
                    });
                }, function (token, callback) {
                    console.log(token);
                    // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
                    // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
                    fs.writeFile('access_token.txt', JSON.stringify(token), callback);
                });
                //var api = new WechatAPI(platformConfig.appid, platformConfig.appsecret);
                api.createMenu(menu, function (err, result) {
                    if (!err) {
                        res.send("待完成，默认菜单已经生成成功")
                    }else{
                        res.send(err);
                    }
                });
            }
        }

    })

});

router.get('/massSendNews',function(req,res) {


    var api = new WechatAPI(platformConfig.appid, platformConfig.appsecret);
    var path1='C:\\Users\\Administrator\\Pictures\\67a6c783ac05ce8c3d79368a46a2ef47.jpg';
    var path2='C:\\Users\\Administrator\\Pictures\\9Nihbn51qJJU8AQXYmtwcuRce68p3DYXFqRmpcrFDFr7EPT1sGVKhmjN5FCepO7m.jpg';
    var type='thumb';
    var mediaId1;
    var mediaId2;
    //api.uploadMedia(path1,type,function(err,result){
    //    if(!err&&result){
    //        mediaId1=result.media_id;
    //        console.log(result);
    //    }else{
    //        res.send(err);
    //    }
    //});
    //api.uploadMaterial(path2,type,function(err,result){
    //    if(!err&&result){
    //        mediaId2=result.media_id;
    //    }else{
    //        res.send(err);
    //    }
    //});
    var news={
      "articles": [
        {
            "thumb_media_id":"m7UAbDBvMZ3AdndU3AKzeZE1NBwr4orDmkXcAwjAblPlBOxvm48qhLFn5XRRfZZg",
          "author":"xxx",
          "title":"Happy Day",
          "content_source_url":"www.qq.com",
          "content":"content",
          "digest":"digest",
          "show_cover_pic":"1"
       }
      ]
    }
    console.log(JSON.stringify(news));
    api.uploadNews(JSON.stringify(news), function(err,result){
        if(!err&&result){
            mediaId=result.media_id;
            console.log(result);
            api.massSendNews(mediaId, true, function(err,result){
                if(!err&&result){
                    res.send(result);
                }else{
                    res.send(err);
                }

            });

        }else{
            res.send(err);
        }
    });
});
router.get('/getAccessToken',function(req,res){
    var reqUrl='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+platformConfig.appid+'&secret='+platformConfig.appsecret;
    var options = {
        method: 'get',
        url: reqUrl
    };
    var access_token;
    request.get(options.url,function(error,response,body){
        if(!error&&response.statusCode==200){
            var tmp=JSON.parse(body);
            access_token=tmp.access_token;
            res.send(tmp);
        }else{
            res.send(error);
        }
    })

});
module.exports = router;