var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring');
var async           =require('async');
var router              = express.Router();
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var myLogger            = require('../logging/contextLogger')("gametemplate");
var gameService        =require('../service/gameService');
var gameTemplateService        =require('../service/gameTemplateService');
var subscriberService        =require('../service/subscriberService');
var activityService        =require('../service/activityService');
var generalService        =require('../service/generalService');
var distributeCouponService        =require('../service/distributeCouponService');

router.post('/getGameParams',function(req,res){
    var options=req.body;
    var gameInstanceId=generalService.parseGameInstanceId(options.gameInstanceId);
    console.log("gameInstanceId"+gameInstanceId);
    var showModule=options.showModule;
    var gameCode=options.gameCode;
    if(showModule==0){
        gameTemplateService.queryOneGameInstanceParams(gameCode,gameInstanceId,function(err,msg){
            if(!err&&msg){
                myLogger.trace("post [/getGameTemplate0]: "+JSON.stringify(msg));
                res.send(msg);

            }else{
                myLogger.trace("post [/getGameTemplate0]:"+JSON.stringify(err));
                res.send(err);
            }
        });
    }else{
        gameTemplateService.queryTestOneGameInstanceParams(gameCode,gameInstanceId,function(err,msg){
            if(!err&&msg){
                myLogger.trace("post [/getGameTemplate0]: "+msg);
                res.send(msg);

            }else{
                myLogger.trace("post [/getGameTemplate0]:"+err);
                res.send(err);
            }
        });
    }

});
router.post('/getBeginStatus' , function(req, res) {
    var options=req.body;
    var gameInstanceId=options.gameInstanceId;
    var gameId=generalService.parseGameInstanceId(gameInstanceId);
    var gameCode=options.gameCode;
    var OpenId=options.OpenId;
    var openId=generalService.decryptoOpenId(OpenId);
    async.waterfall([
        function(icb){
            var activityId;
            activityService.getOneActivityFromGame(gameCode,gameId,function(err,msg){
                if(!err){
                    myLogger.trace("post [/getBeginStatus]:activityService.getOneActivityFromGame "+JSON.stringify(msg));
                    activityId=msg.ACTIVITYID;
                    icb(null,activityId);
                }else{
                    myLogger.trace("post [/getBeginStatus]: activityService.getOneActivityFromGame"+JSON.stringify(err));
                    icb(err,null);
                }
            })

        },
        function(activityId,icb){

            if(openId){
                gameTemplateService.getBeginStatus(activityId,openId,function(msg){
                    if(msg){
                        myLogger.trace("post [/getBeginStatus]:gameTemplateService.getBeginStatus "+JSON.stringify(msg));
                        icb(null,msg);
                    }else{
                        myLogger.trace("post [/getBeginStatus]:gameTemplateService.getBeginStatus "+"服务器错误");
                        icb("服务器错误",null);
                    }

                })
            }
            else{
                returnResult={};
                returnResult.whetherRegister=0;
                returnResult.playStatus=0;
                returnResult.err=true;
                returnResult.msg="抱歉，无法获得您的用户信息";
                myLogger.trace("post [/getBeginStatus]:gameTemplateService.getBeginStatus "+"抱歉，无法获得您的用户信息");
                icb(JSON.stringify(returnResult),null);
            }
        }
    ],function(err,result){
        if(!err){
            res.send(result)
        }else{
            res.send(err);
        }
    })



});
router.post('/getEndStatusWithPhone' , function(req, res) {
    var options=req.body;
    var gameInstanceId=options.gameInstanceId;
    var gameId=generalService.parseGameInstanceId(gameInstanceId);
    var gameCode=options.gameCode;
    var OpenId=options.OpenId;
    var openId=generalService.decryptoOpenId(OpenId);
    var tele=options.phone;
    gameTemplateService.getEndStatusWithPhone(tele,openId,gameCode,gameId,function(err,msg){
        if(!err){
            myLogger.trace("post [/getEndStatus]:gameTemplateService.getEndStatusWithPhone "+JSON.stringify(msg));
            var whetherGift=msg.whetherGift;
            if(whetherGift==1){
                var ruleCode=msg.ruleCode;
                gameTemplateService.gameResult(gameCode,gameId,ruleCode,function(err,msg){
                    myLogger.trace("post [/getEndStatus]:gameTemplateService.gameResult "+JSON.stringify(msg));
                    if(!err){
                        var data={};
                        data.item=msg;
                        data.status=1;
                        res.send(JSON.stringify(data));
                    }
                })
            }else{
                gameTemplateService.gameResult(gameCode,gameId,"",function(err,msg){
                    if(!err){
                        var data={};
                        data.item=msg;
                        data.status=0;
                        console.log("item is"+data.item);
                        res.send(JSON.stringify(data));
                    }
                })
            }
        }else{
            res.send(err);
        }
    });

});
router.post('/getEndStatus',function(req,res){
    var options=req.body;
    var gameInstanceId=options.gameInstanceId;
    var gameId=generalService.parseGameInstanceId(gameInstanceId);
    var gameCode=options.gameCode;
    var OpenId=options.OpenId;
    var openId=generalService.decryptoOpenId(OpenId);
    gameTemplateService.getEndStatus(openId,gameCode,gameId,function(err,msg){
        if(!err){
            myLogger.trace("post [/getEndStatus]:gameTemplateService.getEndStatus "+JSON.stringify(msg));
            var whetherGift=msg.whetherGift;
            if(whetherGift==1){
                var ruleCode=msg.ruleCode;
                gameTemplateService.gameResult(gameCode,gameId,ruleCode,function(err,msg){
                    myLogger.trace("post [/getEndStatus]:gameTemplateService.gameResult "+JSON.stringify(msg));
                    if(!err){
                        var data={};
                        data.item=msg;
                        data.status=1;
                        res.send(JSON.stringify(data));
                    }
                })
            }else{
                gameTemplateService.gameResult(gameCode,gameId,"",function(err,msg){
                    if(!err){
                        var data={};
                        data.item=msg;
                        data.status=0;
                        console.log("item is"+data.item);
                        res.send(JSON.stringify(data));
                    }
                })
            }
        }else{
            res.send(err);
        }
    });
});
module.exports = router;