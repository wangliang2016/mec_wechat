var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring');
var request         =require('request');
var router              = express.Router();
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var myLogger            = require('../logging/contextLogger')("coupon");
var personalCouponService=require("../service/personalCouponService");
var subscriberService=require("../service/subscriberService");
var smsService=require("../service/smsService");
var generalService=require("../service/generalService");
var telCode = {};

router.get('/getPersonalCoupon',function(req,res){
    var openId='oe94fuOYjOApffY9v7ZJ4rRtCLLo';
    var nickname='量量';
    var location="上海 闵行";
    res.render('personalCoupon/personalCoupon',{"OpenId":openId,"NickName":nickname,"Location":location});
    //res.render('games/allGames');
});


router.get('/getMainPersonalCoupon',function(req,res){
    var code =req.query.code;
    var openId;

    subscriberService.getWechatUserInfo(code,function(err,msg){
        if(!err){
            myLogger.trace("get[/getMainPersonalCoupon]: " + msg);
            var tmp=JSON.parse(msg);
            var nickname=tmp.nickname;
            var openId=tmp.openid;
            var location=tmp.province+tmp.city;
            res.redirect('./getMainPersonalCouponInfo?OpenId='+openId+'&NickName='+nickname+'&Location='+location);
        }else{
            myLogger.trace("get[/getMainPersonalCoupon]: " +err);
            res.send(err);
        }
    });
});

router.get('/getMainPersonalCouponInfo*',function(req,res){
    var query=qstring.parse(url.parse(req.url).query);
    res.render('personalCoupon/personalCoupon',{"OpenId":query.OpenId,"NickName":query.NickName,"Location":query.Location});
});

router.get('/getPersonalCouponQR*',function(req,res){
    console.log(req.url);
    var query=qstring.parse(url.parse(req.url).query);
    var couponId=query.CouponId;
    var nickName=query.NickName;
    var location=query.Location;
    res.render('personalCoupon/personalCouponQR',{"CouponId":couponId,"NickName":nickName,"Location":location});
});

router.get('/register*',function(req,res){
    var query=qstring.parse(url.parse(req.url).query);
    var openId=query.openId;
    if(openId!=null){
        res.render('personalCoupon/register',{"OpenId":openId});
    }else{
       res.send("网络存在问题，请稍后查看");
    }

});


router.post('/getPersonalCouponInfo',function(req,res){
    var openId=req.body.openId;
    personalCouponService.queryActiveCouponInfoByUsercode(openId,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }
        else{
            res.send({status:false,msg:err});
        }
    })
});
router.get('/getPersonalCouponInfo',function(req,res){
    var openId='oe94fuOYjOApffY9v7ZJ4rRtCLLo';
    personalCouponService.queryActiveCouponInfoByUsercode(openId,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }
        else{
            res.send({status:false,msg:err});
        }
    })
});

router.post('/getPersonalCouponCode',function(req,res){
    var openId=req.body.openId;
    personalCouponService.queryActiveCouponByUsercode(openId,function(err,msg){
        if(!err){
            res.send({status:true,msg:msg});
        }
        else{
            res.send({status:false,msg:err});
        }
    })
});

router.get('/getTelCode', function(req, res) {
    var telephone=url.parse(req.url,true).query.TELEPHONE;
    var randomNumber = Math.floor(Math.random() * 1000000);
    var code = generalService.autoComple(randomNumber, 6, '0');
    telCode[telephone] = code;

    smsService.sendTelCode(telephone,code,function(err,msg){
        if(!err){
            res.send({status:true,data:msg});
        }
        else{
            res.send({status:false,data:err});
        }
    })
});

router.post('/confirmWithPhone',function(req,res){
    var postParams=req.body;
    var openId=postParams.openId;
    var userCode=postParams.mobile;
    var code=postParams.code;
    if(telCode[userCode]!=code){
        var data = {};
        data.success = false;
        data.msg = "验证码输入错误";
        res.send(data);
    }else{
        personalCouponService.queryActiveCouponByUsercode(openId,function(err,msg){
            if(!err&&msg){
                var couponCodes=JSON.parse(msg).couponinfos;
                console.log(couponCodes.length);
                if(couponCodes.length==0){
                    var data = {};
                    data.success = true;
                    data.msg = "注册成功";
                    res.send(data);
                }else{
                    personalCouponService.confirmOneCouponWithoutRegister(couponCodes,openId,userCode,function(err,msg){
                        console.log(msg);
                        if(!err&&msg.status==true){
                            var data = {};
                            data.success = true;
                            data.msg = "注册成功，所有待领取劵领取成功";
                            res.send(data);
                        }else{
                            var data = {};
                            data.success = false;
                            data.msg = err;
                            res.send(data);
                        }
                    });
                }
            }
            else{
                if(!err&&!msg){
                    var data = {};
                    data.success = false;
                    data.msg = "注册成功";
                    res.send(data);
                }else{
                    var data = {};
                    data.success = false;
                    data.msg = err;
                    res.send(data);
                }
            }
        })
    }

});
module.exports = router;