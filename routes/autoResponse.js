var wechat = require('wechat');
var url=require('url');
var express     = require('express');
var WechatAPI=require('wechat-api');
var app         = express();
var router              = express.Router();
var autoResponseService        =require('../service/autoResponseService');
var wechat_userDAO=require("../dao/wechat_userDAO");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var platformConfig=require('../config/platformConfig.json')[node_env];
var gamelibConfig=require('../config/gamelibConfig.json')[node_env];

function getConfig(appid){
    var config={};
    wechat_userDAO.queryOne({where:{appid:appid}},function(err,msg) {
        if (!err && msg) {
            //console.log(msg);
            config.token = msg.token;
            config.appid = appid;
            config.encodingAESKey = msg.encodingAESKey;
            return config;
        } else {
            return;
        }
    })
};
//要求默认是qbtest
router.get('/*',wechat('qbtest',function(req,res,next){
    console.log("gethere");
    var appid=req.query.appid;
    var message=req.weixin.Content;
    console.log(message);
    var config={};
    wechat_userDAO.queryOne({where:{appid:appid}},function(err,msg){
        if(!err&&msg){
            //console.log(req);
            config.token=msg.token;
            config.appid=appid;
            config.encodingAESKey=msg.encodingAESKey;
            var replyMessage;
            console.log(message);
            autoResponseService.getOneActivityByKeyWords(message,function(err,msg){
                if(!err){
                    var activity=msg;
                    var endYear=activity.ENDAT.getFullYear();
                    var endMonth=activity.ENDAT.getMonth();
                    var endDay=activity.ENDAT.getDate();
                    var endtimes=new Date(endYear,endMonth,endDay).getTime();
                    var date = new Date();
                    var now = date.getTime();
                    var b=(now - endtimes);
                    if(b<0){
                        //开始图文
                        replyMessage=
                            [{
                                title: activity.STARTTITLE,
                                description: activity.STARTINTRO,
                                picurl:gamelibConfig.hostUrl+activity.STARTPIC,
                                url: activity.GAMEADDRESS
                            }];
                    }else{
                        //结束图文
                        replyMessage=
                            [{
                                title: activity.ENDTITLE,
                                description: activity.ENDINTRO,
                                picurl:gamelibConfig.hostUrl+activity.ENDPIC,
                                url: activity.GAMEADDRESS
                            }];
                    }
                    //此处的解决方法即重写wechat，并将其去除node_modules模块
                    //wechat(config,function(req,res,next){
                    //    console.log("hklljl");
                    res.reply(replyMessage);
                    //});
                }else{
                    res.send(err);
                }
            })

        }else{
            if(!err&&!msg){
                res.send("appid参数存在错误",null)
            }
        }
    })
}));
router.post('/*',wechat('qbtest',function(req,res,next){
    console.log("here");
    var appid=req.query.appid;
    var message=req.weixin.Content;
    console.log(message);
    var config={};
    wechat_userDAO.queryOne({where:{appid:appid}},function(err,msg){
        if(!err&&msg){
            //console.log(req);
            config.token=msg.token;
            config.appid=appid;
            config.encodingAESKey=msg.encodingAESKey;
            var replyMessage;
            console.log(message);
            autoResponseService.getOneActivityByKeyWords(message,function(err,msg){
                if(!err){
                    var activity=msg;
                    var endYear=activity.ENDAT.getFullYear();
                    var endMonth=activity.ENDAT.getMonth();
                    var endDay=activity.ENDAT.getDate();
                    var endtimes=new Date(endYear,endMonth,endDay).getTime();
                    var date = new Date();
                    var now = date.getTime();
                    var b=(now - endtimes);
                    if(b<0){
                        //开始图文
                        replyMessage=
                            [{
                                title: activity.STARTTITLE,
                                description: activity.STARTINTRO,
                                picurl:gamelibConfig.hostUrl+activity.STARTPIC,
                                url: activity.GAMEADDRESS
                            }];
                    }else{
                        //结束图文
                        replyMessage=
                            [{
                                title: activity.ENDTITLE,
                                description: activity.ENDINTRO,
                                picurl:gamelibConfig.hostUrl+activity.ENDPIC,
                                url: activity.GAMEADDRESS
                            }];
                    }
                    //此处的解决方法即重写wechat，并将其去除node_modules模块
                    //wechat(config,function(req,res,next){
                    //    console.log("hklljl");
                        res.reply(replyMessage);
                    //});
                }else{
                    res.reply("sorry,请输入正确的关键字");
                }
            })

        }else{
            if(!err&&!msg){
                res.reply("appid参数存在错误")
            }
        }
    })
}));
//router.post('/*', wechat(function (req, res,next) {
//    var message=req.weixin;
//    console.log(message);
//    var input = (message.Content || '').trim();
//
//    if (input === 'login') {
//        res.reply([{
//            title: '登陆页面',
//            description: '去登陆',
//            picurl: 'http://img01.taopic.com/141128/240418-14112Q04Q824.jpg',
//            url: 'http://www.qqjay.com/yijingtupian/86114.html'
//        }]);
//        return;
//    }
//
//    if (input === '大王') {
//        return res.reply("不要叫我大王，要叫我女王大人啊……");
//    }
//    if (input.length < 2) {
//        return res.reply('内容太少，请多输入一点:)');
//    }
//    var data = alpha.search(input);
//    var content = '';
//    switch (data.status) {
//        case 'TOO_MATCHED':
//            content = '找到API过多，请精确一点：\n' + data.result.join(', ').substring(0, 100) + '...';
//            break;
//        case 'MATCHED':
//            content = data.result.map(function (item) {
//                var replaced = (item.desc || '')
//                    .replace(/<p>/ig, '').replace(/<\/p>/ig, '')
//                    .replace(/<code>/ig, '').replace(/<\/code>/ig, '')
//                    .replace(/<pre>/ig, '').replace(/<\/pre>/ig, '')
//                    .replace(/<strong>/ig, '').replace(/<\/strong>/ig, '')
//                    .replace(/<ul>/ig, '').replace(/<\/ul>/ig, '')
//                    .replace(/<li>/ig, '').replace(/<\/li>/ig, '')
//                    .replace(/<em>/ig, '').replace(/<\/em>/ig, '')
//                    .replace(/&#39;/ig, "'");
//
//                return {
//                    title: item.path,
//                    description: item.textRaw + ':\n' + replaced,
//                    picurl: config.domain + '/assets/qrcode.jpg',
//                    url: config.domain + '/detail?id=' + item.hash
//                };
//            });
//            if (data.more && data.more.length) {
//                content.push({
//                    title: '更多：' + data.more.join(', ').substring(0, 200) + '...',
//                    description: data.more.join(', ').substring(0, 200) + '...',
//                    picurl: config.domain + '/assets/qrcode.jpg',
//                    url: config.domain + '/404'
//                });
//            }
//            break;
//        default:
//            res.wait('view');
//            return;
//            break;
//    }
//    var from = message.FromUserName;
//    if (!Array.isArray(content)) {
//        if (from === 'oPKu7jgOibOA-De4u8J2RuNKpZRw') {
//            content = '主人你好：\n' + content;
//        }
//        if (from === 'oPKu7jpSY1tD1xoyXtECiM3VXzdU') {
//            content = '女王大人:\n' + content;
//        }
//    }
//    console.log(content);
//    res.reply(content);
//}));

module.exports = router;