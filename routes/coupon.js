var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring');
var async           =require('async');
var formidable = require('formidable');
var router              = express.Router();
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var couponConfig=require('../config/couponConfig.json')[node_env];
var myLogger            = require('../logging/contextLogger')("cooupon");
var httpsUtil     =require('../interaction/httpsRequest');
var securityService     =require('../security/securityService');
var auth        =require('../security/auth');

router.get('/getEffectiveCouponTemplate',auth.authority,function(req,res){
    //此处要修改，登录之后merchantcode会直接知道
    var date=new Date();
    var data= {
        attributes: [
            'templateid',
            'templatecode',
            'merchantcode',
            'templatecontent',
            'totalnumber'
        ],
        condition: {
            dateexpires:{
                comp:3,
                date:date
            },
            usescope: false
        },
        merchantcode:'20020',
        sign_type:"RSA-SHA1"
    };
    var sign_type="RSA-SHA1";
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,data);
    data['sign']=sig;
    //console.log(JSON.stringify(data));
    var data=JSON.stringify(data);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: '/coupontemplate/querycoupontemplate',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        },
        method: 'POST',
        post_data:data
    };
    console.log(options);
    httpsUtil(options,function(err,msg){
        if(!err){
            //需要验证发送该消息的正确性
            res.send({'status':true,'msg':msg});
        }else{
            res.send({'status':false,'msg':err})
        }
    })

});

router.post('/getcoupontemplate',function(req,res){
    var postParams=req.body;
    var couponCode=postParams.couponCode;
    var merchantCode=postParams.merchantCode;
    var sign_type="RSA-SHA1";
    var data={};
    data.couponcode=couponCode;
    data.merchantcode=merchantCode;;
    data.sign_type=sign_type;
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,data);
    data['sign']=sig;
    //console.log(JSON.stringify(data));
    var data=JSON.stringify(data);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: 'coupontemplate/getcoupontemplate',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        },
        method: 'POST',
        post_data:data
    };

    httpsUtil(options,function(err,msg){
        if(!err){
            //需要验证发送该消息的正确性
            res.send({'status':true,'msg':msg});
        }else{
            res.send({'status':false,'msg':err})
        }
    })

});

router.post('/distributecoupon',function(req,res){
    //此处要修改，登录之后merchantcode会直接知道
    var postParams=req.body;
    var couponCode=postParams.couponcode;
    var merchantCode=postParams.merchantcode;
    var userCode=postParams.usercode;
    var userMerchantCode=postParams.usermerchantcode;
    var templateMerchantCode=postParams.templatemerchantcode;
    var num=postParams.num;
    var sign_type="RSA-SHA1";
    var finaldata={};
    finaldata.couponcode=couponCode;
    finaldata.merchantcode=merchantCode;
    finaldata.usercode=userCode;
    finaldata.num=num;
    //finaldata.sign_type=sign_type;
    finaldata.usermerchantcode=userMerchantCode;
    finaldata.sign_type=sign_type;
    finaldata.templatemerchantcode=templateMerchantCode;
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,data);
    finaldata.sign=sig;
    var data=JSON.stringify(finaldata);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: '/couponinstance/distributecoupon',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        },
        method: 'POST',
        post_data:data
    };

    httpsUtil(options,function(err,msg){
        if(!err){
            //console.log(msg);
            res.send({'status':true,'msg':msg});
        }else{
            res.send(err);
            console.log(err);
        }
    })


});
module.exports = router;