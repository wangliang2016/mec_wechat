var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring')
var router              = express.Router();
var request=        require('request');
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var generalService        =require('../service/generalService');
var myLogger            = require('../logging/contextLogger')("subscriber");
var subscriberService        =require('../service/subscriberService');

router.get('/getOpenId',function(req,res){
    var code =req.query.code;
    var state=req.query.state;
    var openId;
    subscriberService.getOpenId(code,function(err,msg){
        if(!err){
            myLogger.trace("post [/getOpenId]: " + msg);
            res.send(msg);
        }else{
            myLogger.trace("post [/getOpenId]: " +err);
            res.send(err);
        }
    });


});

router.get('/getWechatUserInfo',function(req,res){
    var code =req.query.code;
    subscriberService.getWechatUserInfo(code,function(err,msg){
        if(!err){
            myLogger.trace("post [/getWechatUserInfo]: " + msg);
            res.send(msg);
        }else{
            myLogger.trace("post [/getWechatUserInfo]: " +err);
            res.send(err);
        }
    })
});

router.post('/queryOneSubscriber',function(req,res){
    var postParams=req.body;
    var openId=postParams.openId;
    subscriberService.queryOneSubscriber(openId,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }else{
            res.send({status:false,msg:err});
        }
    })
})

router.post('/queryActivityPlayStatusByOpenId',function(req,res){
    var postParams=req.body;
    //var openId=generalService.decryptoOpenId(postParams.openId);
    var openId=postParams.openId;
    var activityId=postParams.activityId;
    subscriberService.queryActivityPlayStatusByOpenid(openId,activityId,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }else{
            res.send({status:false,msg:err});
        }
    })
});
router.get('/queryActivityPlayStatusByOpenId',function(req,res){
    var data={
        openId:'546074958ddcbceba900790464004671aa2429b71662839e6b5f63060927fb65',
        activityId:1
    };
    var postParams=data;
    //var openId=generalService.decryptoOpenId(postParams.openId);
    var openId=postParams.openId;
    var activityId=postParams.activityId;
    subscriberService.queryActivityPlayStatusByOpenid(openId,activityId,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }else{
            res.send({status:false,msg:err});
        }
    })
});
module.exports = router;