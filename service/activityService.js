var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var async           =require('async');
var exec            = require('child_process').exec;
var myLogger       = require('../logging/contextLogger')("gameService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var WechatAPI = require('wechat-api');
var sequelize       = require('../dao/_sequelize');
var wechat_game1DAO=require("../dao/wechat_game1DAO");
var wechat_activityDAO=require("../dao/wechat_activityDAO");
var wechat_userDAO=require("../dao/wechat_userDAO");
var wechat_subscriber_activityDAO=require("../dao/wechat_subscriber_activityDAO");
var gameLibConfig=require('../config/gamelibConfig.json')[node_env];
var generalService        =require('../service/generalService');
var portConfig=require('../config/portConfig.json')[node_env];

exports.getRelativeActivity=function(queryCondition,gameCode,cb){
    if(queryCondition==null){
        wechat_activityDAO.queryAll({where:{GAMECODE:gameCode},order:'createdAt DESC'},function(err,msg){
            if(!err&&msg){
                var results =[];
                async.forEach(msg,function(result,fcb){
                    wechat_subscriber_activityDAO.queryAndCount({where:{ACTIVITYID:result.ACTIVITYID}},function(err,msg){
                        if(!err&&msg){
                            result.PARTICIPATENUM=msg.count;
                            results.push(result);
                            fcb(null);
                        }else{
                            if(!err&&!msg){
                                result.PARTICIPATENUM=0;
                                results.push(result);
                                fcb(null);
                            }else{
                                fcb(err);
                            }
                        }
                    })
                },function(err,msg){
                    if(!err){
                        cb(null,results);
                    }else{
                        cb(err,null);
                    }
                })
            }else{
                cb(err,msg);
            }
        })
    }else{
        wechat_activityDAO.queryAll({where:{NAME:{$like:'%'+queryCondition+'%'},GAMECODE:gameCode}},function(err,msg){
            if(!err&&msg){
                var results =[];
                async.forEach(msg,function(result,fcb){
                    wechat_subscriber_activityDAO.queryAndCount({where:{ACTIVITYID:result.ACTIVITYID}},function(err,msg){
                        if(!err&&msg){
                            result.PARTICIPATENUM=msg.count;
                            results.push(result);
                            fcb(null);
                        }else{
                            if(!err&&!msg){
                                result.PARTICIPATENUM=0;
                                results.push(result);
                                fcb(null);
                            }else{
                                fcb(err);
                            }
                        }

                    })
                },function(err,msg){
                    if(!err){
                        cb(null,results);
                    }else{
                        cb(err,null);
                    }
                })
            }else{
                cb(err,msg);
            }
        })
    }

}

exports.addActivity=function(activityInfo,userCode,cb){
    var gameCode=activityInfo.GAMECODE;
    activityInfo['USERCODE']=userCode;
    return sequelize.transaction({autocommit: false}).then(function (t) {
        async.waterfall([
            function(icb){
                wechat_userDAO.queryOne({where:{USERCODE:userCode}},function(err,msg){
                    if(!err&&msg){
                        icb(null,msg);
                    }else{
                        if(!err&&!msg){
                            icb("请重新登录",null);
                        }else{
                            icb(err,null);
                        }
                    }
                })
            },
            function (platformconfig,icb) {
                if (gameCode == 1) {
                    wechat_game1DAO.add(activityInfo,t, function (err, msg) {
                        if (!err && msg) {
                            icb(null, msg,platformconfig);
                        } else {
                            icb(err, null);
                        }
                    })
                }
            },
            function (gameInfo, platformconfig,icb) {
                var gameId = gameInfo.GAMEID;
                activityInfo['GAMEID'] = gameId;
                console.log(activityInfo);
                wechat_activityDAO.add(activityInfo, t,function (err, msg) {
                    if (!err) {
                        var activityId=msg.ACTIVITYID;
                        var activityInstanceId = generalService.getGameInstanceID(activityId);
                        var gameAddress = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + platformconfig.appid + "&redirect_uri=" + gameLibConfig.hostUrl + "/gametemplate/maingame&response_type=code&scope=snsapi_userinfo&state=" + activityInstanceId  + "#wechat_redirect";
                        wechat_activityDAO.update({ACTIVITYINSTANCEID:activityInstanceId,GAMEADDRESS:gameAddress},{where:{ACTIVITYID:activityId}},t,function(err,msg){
                            icb(null, msg);
                        })
                    } else {
                        icb(err, null);
                    }
                });
            }
        ], function (err, msg) {
            if (!err) {
                t.commit();
                cb(null, true);
            } else {
                t.rollback();
                cb(err,null);
            }
        })
    });
}

exports.queryOneActivity=function(activityId,cb){
    if(activityId==null){
        cb("活动ID存在问题，请稍后",null);
        return;
    }else{
        wechat_activityDAO.queryOne({where:{ACTIVITYID:activityId}},function(err,msg){
            if(!err&&msg){
                cb(null,msg);
            }else {
                if(!err&&!msg){
                    cb("活动ID存在问题，请稍后",null);
                }else{
                    cb(err,null);
                }
            }
        })
    }
}

exports.queryTotalActivityInfo=function(activityId,cb){
    var activityInfo={};
    wechat_activityDAO.queryOne({where:{ACTIVITYID:activityId}},function(err,msg){
        if(!err&&msg){
            var gameCode=msg.GAMECODE;
            var gameId=msg.GAMEID;
            msg.STARTPIC=portConfig.hostUrl+msg.STARTPIC;
            msg.LOTTERYBACKGROUND=portConfig.hostUrl+msg.LOTTERYBACKGROUND;
            msg.LOTTERYWORD=portConfig.hostUrl+msg.LOTTERYWORD;
            msg.ENDPIC=portConfig.hostUrl+msg.ENDPIC;
            msg.SHAREPIC=portConfig.hostUrl+msg.SHAREPIC;
            msg.ADPIC=portConfig.hostUrl+msg.ADPIC;
            activityInfo=msg.dataValues;
            if(gameCode==1){
               wechat_game1DAO.queryOne({where:{GAMEID:gameId}},function(err,msg){
                    if(!err&&msg){
                        var game=msg;
                        var data={};
                        data.activity=activityInfo;
                        data.game=game;
                        cb(null,data);
                    }else{
                        if(!err&&!msg){
                            cb("活动ID存在问题，请稍后",null);
                        }else{
                            cb(err,null);
                        }
                    }
                })
            }
        }else{
            if(!err&&!msg){
                cb("游戏1ID存在问题，请稍后",null);
            }else{
                cb(err,null);
            }
        }
    })
}

exports.updateSimpleActivity=function(updateInfo,cb){
    if(updateInfo!=null){
        wechat_activityDAO.update(updateInfo,{where:{ACTIVITYID:updateInfo.ACTIVITYID}},function(err,msg){
            cb(err,msg);
        })
    }else{
        cb("更新的信息为null",null);
    }
}

exports.updateActivity=function(updateInfo,userCode,cb){
    updateInfo['USERCODE']=userCode;
    if(updateInfo!=null){
        wechat_activityDAO.update(updateInfo,{where:{ACTIVITYID:updateInfo.ACTIVITYID}},function(err,msg){
            cb(err,msg);
        })
    }else{
        cb("更新的信息为null",null);
    }
}

exports.deleteActivity=function(activityId,cb){
    wechat_activityDAO.del({where:{ACTIVITYID:activityId}},function(err,msg){
        cb(err,msg)
    })
}
