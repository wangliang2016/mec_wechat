var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var async           =require('async');
var exec            = require('child_process').exec;
var myLogger       = require('../logging/contextLogger')("gameService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var securityService=require('../security/securityService');
var staticConfig=require('../config/staticConfig.json')[node_env];
var couponConfig=require('../config/couponConfig.json')[node_env];
var httpsUtil     =require('../interaction/httpsRequest');

exports.distributeCoupon=function(userCode,templateCode,templateMerchantCode,num,activationTime,status,cb){
    var finaldata={};
    finaldata.templatecode=templateCode;
    finaldata.merchantcode=staticConfig.merchantCode;
    finaldata.usercode=userCode;
    finaldata.num=num;
    if(activationTime!=null){
        finaldata.activationtime=activationTime;
    }
    finaldata.status=status;
    var sign_type="RSA-SHA1";
    finaldata.usermerchantcode=staticConfig.merchantCode;
    finaldata.templatemerchantcode=templateMerchantCode;
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,finaldata);
    finaldata.sign=sig;
    finaldata.sign_type=sign_type;
    finaldata=JSON.stringify(finaldata);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: '/couponinstance/distributecoupon',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(finaldata)
        },
        method: 'POST',
        post_data:finaldata
    };

    httpsUtil(options,function(err,msg){
        if(!err){
            //需要验证发送该消息的正确性
            console.log({'status':true,'msg':msg});
            cb(null,{'status':true,'msg':msg});
        }else{
            //console.log(err);
            cb(err,null);
        }
    })
    //httpsUtil(options,function(err,msg){
    //    if(!err){
    //        console.log(msg);
    //    }else{
    //        console.log(err);
    //    }
    //})
}
exports.getonecoupon=function(userCode,couponCode,cb){
    var sign_type="RSA-SHA1";
    var data={};
    data.usercode=userCode;
    data.couponcode=couponCode;
    var merchantCode=staticConfig.merchantCode;
    data.usermerchantcode=staticConfig.merchantCode;
    data.merchantcode=merchantCode;
    data.sign_type=sign_type;
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,data);
    data['sign']=sig;
    //console.log(JSON.stringify(data));
    var data=JSON.stringify(data);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: 'couponinstance/getonecoupon',
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
            console.log(msg);
            //cb(null,{status:true,msg:msg});
        }else{
            console.log(err);
            cb(err,null);
        }
    })
}
exports.modifycoupon=function(userCode,couponCode,cb){
    var sign_type="RSA-SHA1";
    var data={};
    data.usercode=userCode;
    data.couponcode=couponCode;
    var merchantCode=staticConfig.merchantCode;
    data.usermerchantcode=staticConfig.merchantCode;
    data.merchantcode=merchantCode;
    data.sign_type=sign_type;
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,data);
    data['sign']=sig;
    //console.log(JSON.stringify(data));
    var data=JSON.stringify(data);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: 'couponinstance/modifycoupon',
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
            cb(null,{status:true,msg:msg});
        }else{
            cb(err,null);
        }
    })
}
exports.activecoupon=function(userCode,couponCode,orginUserCode,cb){
    var finaldata={};
    finaldata.usercode=userCode;
    finaldata.merchantcode=staticConfig.merchantCode;
    var sign_type="RSA-SHA1";
    finaldata.sign_type=sign_type;
    var coupon={};
    var coupons=[];
    coupons.push(couponCode);
    finaldata.couponcodes=coupons;
    finaldata.originusercode=orginUserCode;
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,finaldata);
    finaldata.sign=sig;
    finaldata=JSON.stringify(finaldata);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: '/couponinstance/activecoupon',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(finaldata)
        },
        method: 'POST',
        post_data:finaldata
    };
    console.log(finaldata);
    httpsUtil(options,function(err,msg){
        console.log(err);
        console.log(msg);
        if(!err&&msg){
            //需要验证发送该消息的正确性
            //console.log(msg);
            if(JSON.parse(msg).status){
                cb(null,msg);
            }else{
                cb(JSON.parse(msg).msg,null);
            }

        }else{
            //console.log(err);
            cb(err,null);

        }
    })
}
exports.querycouponbyusercode=function(userCode,cb){
    var finaldata={};
    finaldata.usercode=userCode;
    finaldata.merchantcode=staticConfig.merchantCode;
    var sign_type="RSA-SHA1";
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,finaldata);
    finaldata.sign=sig;
    finaldata=JSON.stringify(finaldata);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: '/couponinstance/querycouponbyusercode',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(finaldata)
        },
        method: 'POST',
        post_data:finaldata
    };

    httpsUtil(options,function(err,msg){
        if(!err&&msg){
            //需要验证发送该消息的正确性
            if(JSON.parse(msg).status){
                cb(null,msg);
            }else{
                cb(JSON.parse(msg).msg,null);
            }

        }else{
            cb(err,null);

        }
    })
}
exports.invalidcoupon=function(couponCodes,cb){
    var finaldata={};
    finaldata.couponcodes=couponCodes;
    finaldata.merchantcode=staticConfig.merchantCode;
    var sign_type="RSA-SHA1";
    finaldata.sign_type=sign_type;
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,finaldata);
    finaldata.sign=sig;
    finaldata=JSON.stringify(finaldata);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: '/couponinstance/invalidcoupon',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(finaldata)
        },
        method: 'POST',
        post_data:finaldata
    };

    httpsUtil(options,function(err,msg){
        if(!err&&msg){
            //需要验证发送该消息的正确性
            //console.log(msg);
            if(JSON.parse(msg).status){
                cb(null,msg);
            }else{
                cb(JSON.parse(msg).msg,null);
            }

        }else{
            //console.log(err);
            cb(err,null);

        }
    })
}
exports.querycouponinstance=function(condition,cb){
    var finaldata={};
    finaldata.condition=condition;
    finaldata.merchantcode=staticConfig.merchantCode;
    var sign_type="RSA-SHA1";
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,finaldata);
    finaldata.sign_type=sign_type;
    finaldata.sign=sig;
    finaldata=JSON.stringify(finaldata);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: '/couponinstance/querycouponinstance',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(finaldata)
        },
        method: 'POST',
        post_data:finaldata
    };

    httpsUtil(options,function(err,msg){
        if(!err&&msg){
            //需要验证发送该消息的正确性
            if(JSON.parse(msg).status){
                cb(null,msg);
            }else{
                cb(JSON.parse(msg).msg,null);
            }

        }else{
            //console.log(err);
            cb(err,null);

        }
    })
}
exports.querycouponinstanceinfo=function(condition,cb){
    var finaldata={};
    finaldata.condition=condition;
    finaldata.merchantcode=staticConfig.merchantCode;
    var sign_type="RSA-SHA1";
    var key=fs.readFileSync('../security/keys/client.key').toString('ascii');
    var sig=securityService.getSign(key,sign_type,finaldata);
    finaldata.sign_type=sign_type;
    finaldata.sign=sig;
    finaldata=JSON.stringify(finaldata);
    var options = {
        hostname: couponConfig.hostname,
        port: couponConfig.port,
        path: '/couponinstance/querycouponinstanceinfo',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(finaldata)
        },
        method: 'POST',
        post_data:finaldata
    };

    httpsUtil(options,function(err,msg){
        if(!err&&msg){
            //需要验证发送该消息的正确性
            if(JSON.parse(msg).status){
                cb(null,msg);
            }else{
                cb(JSON.parse(msg).msg,null);
            }

        }else{
            //console.log(err);
            cb(err,null);

        }
    })
}