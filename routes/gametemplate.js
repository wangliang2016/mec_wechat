var express = require('express');
var path = require('path');
var url = require('url');
var fs = require('fs');
var qstring = require('querystring');
var async = require('async');
var router = express.Router();
var generalService = require('../service/generalService');
var subscriberService = require('../service/subscriberService');
var activityService = require('../service/activityService');
var node_env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';

router.get('/getGameTemplate', function (req, res) {
    var query = qstring.parse(url.parse(req.url).query);
    var openId = query.OpenId;
    var activityId = query.activityId;
    var gameCode = query.gameCode;
    if(openId==null){
        res.send('页面已经过期');
    }else {
        res.render('gameTemplate/gameTemplate' + gameCode, {
            "activityId": activityId,
            "OpenId": openId
        });
    }
});

router.get('/maingame', function (req, res) {
    var query = qstring.parse(url.parse(req.url).query);
    var code = req.query.code;
    var activityInstanceId = req.query.state;
    var activityId = generalService.parseGameInstanceId(activityInstanceId);
    var openId;
    //默认是分享计数方式是多少人打开该链接
    subscriberService.getOpenId(code, function (err, msg) {
        if (!err) {
            //myLogger.trace("get [/maingame]: " + msg);
            openId = msg;
            console.log("maingame中的openId" + msg);
            //var cryptoOpenId = generalService.cryptoOpenId(openId);
            activityService.queryOneActivity(activityId, function (err, msg) {
                if (!err && msg) {
                    if (msg.ACTIVITYINSTANCEID == activityInstanceId) {
                        var shareNum = msg.SHARENUM;
                        var upperPlayNum = msg.UPPERPLAYNUM;
                        var funPlayNum = msg.FUNPLAYNUM;
                        var gameCode = msg.GAMECODE;
                        var visitNum =msg.VISITNUM;
                        activityService.updateSimpleActivity({VISITNUM:visitNum+1,ACTIVITYID:activityId},function (err,msg) {
                            ;
                        })
                        //说明该链接是他人分享的
                        console.log(query);
                        if (query.shareid != null) {
                            console.log("here");
                            var shareId = query.shareid;
                            subscriberService.queryActivityPlayStatusByOpenid(shareId, activityId, function (err, msg) {
                                if (!err && msg) {
                                    if (msg.subscriberStatus == false) {
                                        if (msg.activityStatus == true) {
                                            var playTimes = msg.activtyMsg.PLAYTIMES;
                                            var shareTimes = msg.activtyMsg.SHARETIMES++;
                                            if (playTimes < upperPlayNum) {
                                                if (shareTimes > shareNum) {
                                                    var data = {
                                                        PLAYTIMES: playTimes++,
                                                        SHARETIMES: shareTimes - shareNum
                                                    }
                                                    subscriberService.updateOpenidActivity(shareId, activityId, data, function (err, msg) {
                                                        if (!err) {
                                                            res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                                                        } else {
                                                            res.send("页面显示错误" + err);
                                                        }
                                                    })
                                                } else {
                                                    var data = {
                                                        SHARETIMES: shareTimes
                                                    }
                                                    subscriberService.updateOpenidActivity(shareId, activityId, data, function (err, msg) {
                                                        if (!err) {
                                                            res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                                                        } else {
                                                            res.send("页面显示错误" + err);
                                                        }
                                                    })
                                                }
                                            } else {
                                                res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                                            }
                                        } else {
                                            subscriberService.addOpenidActivity(openId, activityId, 0, null, funPlayNum, 0, 1, function (err, msg) {
                                                if (!err) {
                                                    res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                                                } else {
                                                    res.send("页面显示错误" + err);
                                                }
                                            })
                                        }
                                    } else {
                                        var userId = msg.subscribeMsg.USERID;
                                        if (msg.activityStatus == true) {
                                            var playTimes = msg.activtyMsg.PLAYTIMES;
                                            var shareTimes = msg.activtyMsg.SHARETIMES++;
                                            if (playTimes < upperPlayNum) {
                                                if (shareTimes > shareNum) {
                                                    var data = {
                                                        PLAYTIMES: playTimes++,
                                                        SHARETIMES: shareTimes - shareNum
                                                    }
                                                    subscriberService.updateSubscriberActivity(userId, activityId, data, function (err, msg) {
                                                        if (!err) {
                                                            res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                                                        } else {
                                                            res.send("页面显示错误" + err);
                                                        }
                                                    })
                                                } else {
                                                    var data = {
                                                        SHARETIMES: shareTimes
                                                    }
                                                    subscriberService.updateSubscriberActivity(userId, activityId, data, function (err, msg) {
                                                        if (!err) {
                                                            res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                                                        } else {
                                                            res.send("页面显示错误" + err);
                                                        }
                                                    })
                                                }
                                            } else {
                                                res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                                            }
                                        } else {
                                            subscriberService.addSubscriberActivity(userId, activityId, 0, null, funPlayNum, 0, 1, function (err, msg) {
                                                if (!err) {
                                                    res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                                                } else {
                                                    res.send("页面显示错误" + err);
                                                }
                                            })
                                        }
                                    }
                                } else {
                                    res.send("页面显示错误" + err);
                                }
                            })
                        }else{
                            res.redirect('./getGameTemplate?gameCode=' + gameCode + "&OpenId=" + openId + "&activityId=" + activityId);
                        }
                    } else {
                        res.send = "游戏地址存在错误";
                    }
                } else {
                    if (!err && !msg) {
                        //myLogger.trace("post [/maingame]: " + "游戏地址存在错误");
                        res.send = "游戏地址存在错误";
                    } else {
                        //myLogger.trace("post [/maingame]: " + err);
                        res.send(err);
                    }
                }
            });
        }
    });


});

router.get('/copymaingame', function (req, res) {
    var gameInstanceId = '26GS2ZDU4CWN3312';
    var gameCode = 1;
    var gameId = generalService.parseGameInstanceId(gameInstanceId);
    var openId = 'oe94fuOYjOApffY9v7ZJ4rRtCLLo';
    activityService.queryOneActivity(gameId, function (err, msg) {
        if (!err && msg) {
            if (msg.ACTIVITYINSTANCEID == gameInstanceId) {
                res.render('gameTemplate/gameTemplate' + gameCode, {
                    "activityId": gameId,
                    "OpenId": openId
                });
            }
        } else {
            if (!err && !msg) {
                res.send = "游戏地址存在错误";
            } else {
                res.send(err);
            }
        }

    })

});
router.get('/activityIntroduction*', function (req, res) {
    var query = qstring.parse(url.parse(req.url).query);
    var activityId=query.activityId;
    //此处需要将gameid转换成activityid，通过传给的网址中的参数得到gameid
    res.render('gameTemplate/activityIntroduction', {'activityId': activityId});
});
module.exports = router;