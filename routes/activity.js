var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring');
var async           =require('async');
var formidable = require('formidable');
var router              = express.Router();
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var activityService        =require('../service/activityService');
var game1Service        =require('../service/game1Service');
var myLogger            = require('../logging/contextLogger')("activity");
var portConfig=require('../config/portConfig.json')[node_env];
var auth        =require('../security/auth');

router.post('/queryRelativeActivity',auth.authority,function(req,res){
    var postParams=req.body;
    var gameCode=postParams.gamecode;
    var queryWord=postParams.queryword;
    activityService.getRelativeActivity(queryWord,gameCode,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }else{
            res.send({status:false,msg:err});
        }
    })
});

router.post('/addOneActivity',auth.authority,function(req,res){
    var postParams=req.body;
    console.log(postParams);
    var activityInfo=postParams.activityInfo;
    //增加session之后需要修改usercode
    var userCode=req.session.usercode;
    var sum=0;
    for(var i=0;i<7;i++){
        var probability='PROBABILITY'+i;
        if(activityInfo[probability]!=null){
            sum+=parseInt(activityInfo[probability]);
        }
    }
    console.log(sum);
    if(sum!=100){
        res.send("设置奖项的概率存在问题");
    }else{
        activityService.addActivity(activityInfo,userCode,function(err,msg){
            if(!err){
                res.send({status:true});
            }else{
                res.send({status:false});
            }
        });
    }
});
router.get('/addOneActivity',function(req,res){
    var postParams=req.body;
    var activityInfo=postParams.activityInfo;
    //增加session之后需要修改usercode
    var userCode=0;
    var sum=0;
    for(var i=0;i<7;i++){
        var probability='PROBABILITY'+i;
        if(activityInfo[probability]!=null){
            sum+=activityInfo[probability];
        }
    }
    if(sum!=100){
        res.send("设置奖项的概率存在问题",null);
    }
    activityService.addActivity(activityInfo,userCode,function(err,msg){

    });
});
router.post('/queryOneActivity',auth.authority,function(req,res){
    var postParams=req.body;
    var activityId=postParams.activityId;
    activityService.queryOneActivity(activityId,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }else{
            res.send({status:false,msg:msg});
        }
    })
});
router.post('/wqueryOneActivity',function(req,res){
    var postParams=req.body;
    var activityId=postParams.activityId;
    console.log(activityId);
    activityService.queryOneActivity(activityId,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }else{
            res.send({status:false,msg:msg});
        }
    })
});

router.post('/queryTotalActivityInfo',function(req,res){
    var postParams=req.body;
    var activityId=postParams.activityId;
    activityService.queryOneActivity(activityId,function(err,msg){
        if(!err){
            var activity=msg.dataValues;
            var gameCode=msg.GAMECODE;
            var gameId=msg.GAMEID;
            msg.STARTPIC=portConfig.hostUrl+msg.STARTPIC;
            msg.LOTTERYBACKGROUND=portConfig.hostUrl+msg.LOTTERYBACKGROUND;
            msg.LOTTERYWORD=portConfig.hostUrl+msg.LOTTERYWORD;
            msg.ENDPIC=portConfig.hostUrl+msg.ENDPIC;
            msg.SHAREPIC=portConfig.hostUrl+msg.SHAREPIC;
            msg.ADPIC=portConfig.hostUrl+msg.ADPIC;
            activity.PICHOSTURL=portConfig.hostUrl;
            if(gameCode==1){
                game1Service.queryOneGame(gameId,function(err,msg){
                    if(!err){
                        var game=msg.dataValues;
                        res.send({status:true,msg:{activity:activity,game:game}});
                    }else{
                        res.send({status:false,msg:err});
                    }
                })
            }
        }else{
            res.send({status:false,msg:err});
        }
    })
})
router.get('/queryTotalActivityInfo',function(req,res){
    var postParams={activityId:43};
    var activityId=postParams.activityId;
    activityService.queryOneActivity(activityId,function(err,msg){
        if(!err){
            var activity=msg.dataValues;
            var gameCode=msg.GAMECODE;
            var gameId=msg.GAMEID;
            msg.STARTPIC=portConfig.hostUrl+msg.STARTPIC;
            msg.LOTTERYBACKGROUND=portConfig.hostUrl+msg.LOTTERYBACKGROUND;
            msg.LOTTERYWORD=portConfig.hostUrl+msg.LOTTERYWORD;
            msg.ENDPIC=portConfig.hostUrl+msg.ENDPIC;
            msg.SHAREPIC=portConfig.hostUrl+msg.SHAREPIC;
            msg.ADPIC=portConfig.hostUrl+msg.ADPIC;
            activity.PICHOSTURL=portConfig.hostUrl;
            if(gameCode==1){
                game1Service.queryOneGame(gameId,function(err,msg){
                    if(!err){
                        var game=msg.dataValues;
                        res.send({status:true,msg:{activity:activity,game:game}});
                    }else{
                        res.send({status:false,msg:err});
                    }
                })
            }
        }else{
            res.send({status:false,msg:err});
        }
    })
})

router.post('/updateOneActivity',auth.authority,function(req,res){
    var postParams=req.body;
    var activityInfo=postParams.activityInfo;
    //增加session之后需要修改usercode
    var userCode=req.session.usercode;
    var sum=0;
    for(var i=0;i<7;i++){
        var probability='PROBABILITY'+i;
        if(activityInfo[probability]!=null){
            sum+=activityInfo[probability];
        }
    }
    if(sum!=100){
        res.send("设置奖项的概率存在问题",null);
    }
    activityService.updateActivity(activityInfo,userCode,function(err,msg){
        //执行一定的界面跳转
    });
});

router.post('/deleteOneActivity',auth.authority,function(req,res){
    var postParams=req.body;
    var activityId=postParams.activityId;
    activityService.deleteActivity(activityId,function(err,msg){
        //刷新页面，并告诉删除成功
        if(!err){
            res.send({status:true});
        }else{
            res.send({status:false});
        }
    });
});
module.exports = router;