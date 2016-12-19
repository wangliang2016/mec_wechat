var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var qstring         =require('querystring');
var request=        require('request');
var myLogger       = require('../logging/contextLogger')("subscriberService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var wechat_subscriberDAO=require("../dao/wechat_subscriberDAO");
var wechat_subscriber_activityDAO=require("../dao/wechat_subscriber_activityDAO");
var wechat_openid_activityDAO=require("../dao/wechat_openid_activityDAO");

exports.getOpenId=function(code,cb){
    console.log("getOpenId的code是"+code);
    var reqUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?';
    var params = {
        appid: 'wx5c30177c4f734b4c',
        secret: '2fad2f352234704fb24fbcb5da5d3f56',
        code: code,
        grant_type: 'authorization_code'
    };

    var options = {
        method: 'get',
        url: reqUrl+qstring.stringify(params)
    };
    var access_token;
    var openid;
    request.get(options.url,function(error,response,body){
        if(!error&&response.statusCode==200){
            var tmp=JSON.parse(body);
            access_token=tmp.access_token;
            openid=tmp.openid;
            console.log(body);
            cb(null,openid);
        }else{
            cb(error,null);
        }
    })
}
exports.getWechatUserInfo=function(code,cb){
    var reqUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?';
    var params = {
        appid: 'wx5c30177c4f734b4c',
        secret: '2fad2f352234704fb24fbcb5da5d3f56',
        code: code,
        grant_type: 'authorization_code'
    };

    var options = {
        method: 'get',
        url: reqUrl+qstring.stringify(params)
    };
    var access_token;
    var openid;
    request.get(options.url,function(error,response,body){
        if(!error&&response.statusCode==200){
            var tmp=JSON.parse(body);
            access_token=tmp.access_token;
            openid=tmp.openid;
            var userUrl='https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN';
            request.get(userUrl,function(error,response,body){
                if(!error&&response.statusCode==200){
                    cb(null,body);
                }
                else{
                    cb(error,null);
                }
            })
        }else{
            cb(error,null);
        }
    })
}
exports.queryOneSubscriber=function(openId,cb){
    var qry={'where':{'OPENID': openId}};
    wechat_subscriberDAO.queryOne(qry,function(err,msg){
        if(!err){
            cb(null,msg);
        }
        else{
            cb(err,null);
        }
    });
}
exports.queryActivityPlayStatusByUserid=function(userId,activityId,cb){
    var qry={'where':{'USERID': userId,'ACTIVITYID':activityId}};
    wechat_subscriber_activityDAO.queryOne(qry,function(err,msg){
        if(!err){
            cb(null,msg);
        }else{
            cb(err,null);
        }
    })
};
exports.queryActivityPlayStatusByOpenid=function(openId,activityId,cb){
    wechat_subscriberDAO.queryOne({where:{'OPENID': openId}},function(err,msg){
        if(!err&&msg){
            var subscriberInfo=msg.dataValues;
            var userId=msg.USERID;
            var qry={'where':{'USERID': userId,'ACTIVITYID':activityId}};
            wechat_subscriber_activityDAO.queryOne(qry,function(err,msg){
                if(!err&&msg){
                    cb(null,{subscriberStatus:true,activityStatus:true,subscribeMsg:subscriberInfo,activtyMsg:msg});
                }else{
                    if(!err&&!msg){
                        cb(null,{subscriberStatus:true,activityStatus:false,subscribeMsg:subscriberInfo,activtyMsg:null});
                    }else{
                        cb({subscriberStatus:true,activityStatus:false,subscribeMsg:subscriberInfo,activtyMsg:err},null);
                    }

                }
            })
        }else{
            if(!err&&!msg){
                wechat_openid_activityDAO.queryOne({where:{OPENID:openId,ACTIVITYID:activityId}},function(err,msg){
                    if(!err&&msg){
                        cb(null,{subscriberStatus:false,activityStatus:true,subscribeMsg:null,activtyMsg:msg});
                    }else{
                        if(!err&&!msg){
                            cb(null,{subscriberStatus:false,activityStatus:false,subscribeMsg:null,activtyMsg:null});
                        }else{
                            cb({subscriberStatus:false,activityStatus:false,subscribeMsg:null,activtyMsg:err},null);
                        }

                    }
                })
            }else{
                cb({subscriberStatus:false,activityStatus:false,subscribeMsg:err,activtyMsg:null},null);
            }
        }

    });

}
exports.addSubscriberActivity= function (userId,activityId,havePlayedNum,recentPlayTime,playTimes,prizeNum,shareTimes,cb) {
    var data={
        USERID:userId,
        ACTIVITYID:activityId,
        HAVEPLAYEDNUM:havePlayedNum,
        RECENTPLAYTIME:recentPlayTime,
        PLAYTIMES:playTimes,
        PRIZENUM:prizeNum,
        SHARETIMES:shareTimes
    }
    wechat_subscriber_activityDAO.add(data,function(err,msg){
        if(!err){
            cb(null,msg);
        }else{
            cb(err,null);
        }
    })
}
exports.updateSubscriberActivity= function (userId,activityId,updateInfo,cb) {
    //var data={
    //    USERID:userId,
    //    ACTIVITYID:activityId,
    //    HAVEPLAYEDNUM:havePlayedNum,
    //    RECENTPLAYTIME:recentPlayTime,
    //    PLAYTIMES:playTimes
    //}
    var qry={where:{ USERID:userId,ACTIVITYID:activityId}};
    wechat_subscriber_activityDAO.update(updateInfo,qry,function(err,msg){
        if(!err){
            cb(null,msg);
        }else{
            cb(err,null);
        }
    })
}
exports.querySubscriberActivity=function(userId,activityId,cb){
    wechat_subscriber_activityDAO.queryOne({where:{USERID:userId,ACTIVITYID:activityId}},function(err,msg){
        cb(err,msg);
    })
}
exports.addSubscriber=function(tele,openId,password,cb){
    var data={
        ROLE:0,
        TELEPHONE:tele,
        OPENID:openId,
        HASH:password
    }
    wechat_subscriberDAO.add(data,function(err,msg){
        if(!err){
            cb(null,msg);
        }else{
            cb(err,null);
        }
    })
}

exports.addOpenidActivity=function(openId,activityId,havePlayedNum,recentPlayTime,playTimes,prizeNum,shareTimes,cb) {
    var data={
        OPENID:openId,
        ACTIVITYID:activityId,
        HAVEPLAYEDNUM:havePlayedNum,
        RECENTPLAYTIME:recentPlayTime,
        PLAYTIMES:playTimes,
        PRIZENUM:prizeNum,
        SHARETIMES:shareTimes
    }
    wechat_openid_activityDAO.add(data,function(err,msg){
        if(!err){
            cb(null,msg);
        }else{
            cb(err,null);
        }
    })
}
exports.updateOpenidActivity=function(openId,activityId,updateInfo,cb) {
    //var data={
    //    OPENID:openId,
    //    ACTIVITYID:activityId,
    //    HAVEPLAYEDNUM:havePlayedNum,
    //    RECENTPLAYTIME:recentPlayTime,
    //    PLAYTIMES:playTimes
    //}
    var qry={where:{ OPENID:openId,ACTIVITYID:activityId}};
    wechat_openid_activityDAO.update(updateInfo,qry,function(err,msg){
        if(!err){
            cb(null,msg);
        }else{
            cb(err,null);
        }
    })
}
//增加一张openid和activity关联的临时表，只有当用户提交手机号，才删除临时表的数据将信息插入到subscriber表，所以非注册用户首先查看subscriber表
//如果没有查看临时表，如果该用户玩过该游戏则查看他是否仍有可以玩的机会，若有则继续玩，输入手机号后根据临时表的信息写入subscriber和activity的关系表
//之后删除临时表的信息