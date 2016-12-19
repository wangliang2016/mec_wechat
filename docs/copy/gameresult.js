//接口流程为非注册用户首先向劵池中索要劵（已分配的劵数量包括非激活的劵）当显示有数量时，就向劵池分配一张实例劵，它的status为2，并
// 给予劵的过期时间。之后用户如果在规定时间内可以将劵由未激活劵变为激活劵，并修改它的usercode。如果在非规定时间内激活再激活则显示失败
//劵池在使用优惠券时需要查看劵实例的status是否是未使用的劵，status其中未使用劵分为激活劵0和非激活劵2
//
var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring');
var async           =require('async');
var router              = express.Router();
var generalService        =require('../service/generalService');
var resultService        =require('../service/resultService');
var activityService        =require('../service/activityService');
var couponService        =require('../service/couponService');
var subscriberService        =require('../service/subscriberService');
//var couponTmpService        =require('../service/couponTmpService');
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var staticConfig=require('../config/staticConfig.json')[node_env];
var sequelize   = require('../dao/_sequelize');

router.post('/resultWithRegister',function(req,res){
    var postParams=req.body;
    var subscriberId=postParams.userId;
    var activityId=postParams.activityId;
    var activityInfo;
    var totalNum;
    var gameInfo;
    var userCode;//该处存的是手机号
    var userMerchantCode=staticConfig.merchantCode;
    var merchantCode=staticConfig.merchantCode;
    var distributeNum=1;
    var gameParams=[];
    var oneCoupon;
    async.waterfall([
        function(icb){
            activityService.queryTotalActivityInfo(activityId,function(err,msg){
                if(!err&&msg) {
                    activityInfo = msg.activity;
                    gameInfo = msg.game;
                    userCode=postParams.userCode;//该处存的是手机号
                    subscriberId=postParams.userId;
                    totalNum=activityInfo.FUNPLAYNUM;
                    icb(null);
                }else{
                    var data = {};
                    data.success = false;
                    data.name = "获取奖品信息失败";
                    res.send(data);
                    return;
                }
            })
        },
        function(icb){
            for(var i=0;i<7;i++){
                var title="MODULETITLE"+i;
                var content="MODULECONTENT"+i;
                var num="MODULEGOODSNUM"+i;
                var coupon="MODULECOUPON"+i;
                var probability="PROBABILITY"+i;
                if(gameInfo[title]!=null){
                    var gameParam={};
                    gameParam.probability=gameInfo[probability];
                    gameParam.level=i;
                    gameParam.couponcode=gameInfo[coupon];
                    gameParam.content=gameInfo[content];
                    gameParam.title=gameInfo[title];
                    gameParams.push(gameParam);
                }
            }
            gameParams.sort(function (a, b) {
                return (a.level - b.level);
            });
            oneCoupon=resultService.chooseCoupon(gameParams);
            console.log(oneCoupon);

            if(gameParams[oneCoupon].couponcode!=null){
                var templateCode=gameParams[oneCoupon].couponcode.split('&')[0];
                var templateMerchantCode=gameParams[oneCoupon].couponcode.split('&')[1];
                //usercode即为用户的手机号
                //merchantcode为当前登录的商户号
                var couponStatus=0;
                resultService.resultWithRegister(subscriberId,templateCode,templateMerchantCode,merchantCode,activityId,distributeNum,couponStatus,function(err,msg){
                    if(!err&&msg){
                        //已经成功发劵
                        var newCouponCode=msg.couponcode;
                        var data={};
                        data.success=true;
                        data.name=gameParams[oneCoupon].title;
                        data.sn=newCouponCode;
                        data.award=gameParams[oneCoupon].content;
                        data.prize_name=gameParams[oneCoupon].content;
                        data.prize_address="见优惠券详情";
                        res.send(data);
                    }else{
                        var data={};
                        data.success=false;
                        //data.name="谢谢参与";
                        data.name=err;
                        res.send(data);
                    }
                })
            }else{
                subscriberService.querySubscriberActivity(subscriberId,activityId,function(err,msg){
                    if(!err&&msg){
                        subscriberService.updateSubscriberActivity(msg.USERID,msg.ACTIVITYID,msg.HAVEPLAYEDNUM+1,new Date(),msg.PLAYTIMES,function(err,msg){
                            if(!err){
                                var data={};
                                data.success=false;
                                data.name="谢谢参与";
                                res.send(data);
                            }else{
                                var data={};
                                data.success=false;
                                //data.name="谢谢参与";
                                data.name=err;
                                res.send(data);
                            }
                        })
                    }else{
                        if(!err&&!msg){
                            //表示此时用户并没有玩过该游戏
                            var date=new Date();
                            subscriberService.addSubscriberActivity(subscriberId,activityId,1,date,activityInfo.FUNPLAYNUM,function(err,msg){
                                if(!err){
                                    var data={};
                                    data.success=false;
                                    data.name="谢谢参与";
                                    res.send(data);
                                }else{
                                    var data={};
                                    data.success=false;
                                    //data.name="谢谢参与";
                                    data.name=err;
                                    res.send(data);
                                }
                            })
                        }
                    }
                })
            }
        }],function(err,msg){

    })
})

router.post('/resultWithoutRegister',function(req,res){
    //该处需要检测用户是否真的具有领取奖品身份
    var postParams=req.body;
    var activityId=postParams.activityId;
    var openId=generalService.decryptoOpenId(postParams.openId);

    var activityInfo={};
    var gameInfo={};
    var whetherPlay=false;//代表是否已经玩过该游戏
    var whetherRegister=false;
    var totalNum=0;
    var useNum=0;
    //var userCode=staticConfig.userCode;//该处存的是系统默认的手机号即000000
    //此处usercode为用户的openid
    var userCode=openId;
    var userMerchantCode=staticConfig.merchantCode;
    var merchantCode=staticConfig.merchantCode;
    var distributeNum=1;
    var gameParams=[];
    var oneCoupon=0;
    async.waterfall([
        function(icb){
            activityService.queryTotalActivityInfo(activityId,function(err,msg){
                if(!err&&msg) {
                    activityInfo = msg.activity;
                    gameInfo = msg.game;
                    totalNum=activityInfo.FUNPLAYNUM;
                    icb(null);
                }else{
                    var data = {};
                    data.success = false;
                    data.name = "获取奖品信息失败";
                    res.send(data);
                    return;
                }
            })
        },
        function(icb){
            subscriberService.queryActivityPlayStatusByOpenid(openId,activityId,function(err,msg){
                if(msg.subscriberStatus==false){
                    if(msg.activityStatus==true){
                        whetherPlay=true;
                        totalNum = msg.activtyMsg.PLAYTIMES;
                        useNum = msg.activtyMsg.HAVEPLAYEDNUM;
                        whetherRegister = true;
                        if (totalNum<=useNum) {
                            var data = {};
                            data.success = false;
                            data.name = "谢谢参与";
                            res.send(data);
                            return;
                        }else{
                            useNum++;
                            icb(null);
                        }
                    }else{
                        if(msg.activtyMsg==null&&msg.subscribeMsg==null){
                            totalNum=activityInfo.FUNPLAYNUM;
                            useNum=1;
                            icb(null);
                        }else{
                            var data = {};
                            data.success = false;
                            data.name = "谢谢参与";
                            res.send(data);
                            return;
                        }
                    }
                }else{
                    var data = {};
                    data.success = false;
                    data.name = "谢谢参与";
                    //data.name=err;
                    res.send(data);
                    return;
                }
            })
        },
        function(icb){
            //谢谢参与的概率也被算在其中
            for(var i=0;i<7;i++){
                var title="MODULETITLE"+i;
                var content="MODULECONTENT"+i;
                var num="MODULEGOODSNUM"+i;
                var coupon="MODULECOUPON"+i;
                var probability="PROBABILITY"+i;
                if(gameInfo[title]!=null&&gameInfo[probability]!=null){
                    var gameParam={};
                    gameParam.probability=gameInfo[probability];
                    gameParam.level=i;
                    gameParam.couponcode=gameInfo[coupon];
                    gameParam.content=gameInfo[content];
                    gameParam.title=gameInfo[title];
                    gameParams.push(gameParam);
                }
            }
            gameParams.sort(function (a, b) {
                return (a.level - b.level);
            });
            oneCoupon=resultService.chooseCoupon(gameParams);
            console.log(oneCoupon);
            if(whetherPlay==true){
                var date=new Date();
                subscriberService.updateOpenidActivity(openId,activityId,useNum,date,totalNum,function(err,msg){
                    if(err){
                        var data = {};
                        data.success = false;
                        data.name = err;
                        res.send(data);
                        return;
                    }else{
                        icb(null);
                    }
                })
            }else{
                var date=new Date();
                subscriberService.addOpenidActivity(openId,activityId,useNum,date,totalNum,function(err,msg){
                    if(err){
                        var data = {};
                        data.success = false;
                        data.name = err;
                        res.send(data);
                        return;
                    }else{
                        icb(null);
                    }
                })
            }
        },
        function(icb){
            if(gameParams[oneCoupon].couponcode!=null){
                var templateCode=gameParams[oneCoupon].couponcode.split('&')[0];
                var templateMerchantCode=gameParams[oneCoupon].couponcode.split('&')[1];
                var activationTime=activityInfo.ACTIVATIONTIME;
                console.log(activationTime);
                //usercode即为用户的手机号
                //merchantcode为当前登录的商户号
                var couponStatus=2;
                resultService.resultWithoutRegister(userCode,userMerchantCode,templateCode,templateMerchantCode,merchantCode,activityId,distributeNum,activationTime,couponStatus,function(err,msg){
                    if(!err&&msg.status){
                        var somemsg=JSON.parse(msg.msg);
                        //已经成功发劵
                        if(somemsg.status==true){
                            var newCouponCode=somemsg.couponinfo[0].couponcode;
                            var newMerchantCode=somemsg.couponinfo[0].merchantcode;
                            var data={}
                            data.success=true;
                            data.name=gameParams[oneCoupon].title;
                            data.sn=newCouponCode;
                            data.merchantcode=newMerchantCode;
                            data.award=gameParams[oneCoupon].content;
                            data.prize_name=gameParams[oneCoupon].content;
                            data.prize_address="见优惠券详情";
                            res.send(data);
                            return;
                        }else{
                            var data = {};
                            data.success = false;
                            //data.name="谢谢参与";
                            //data.name = "获取奖品信息失败";
                            data.name = err;
                            res.send(data);
                            return;
                        }
                    }else {
                        //表示此时系统存在一些错误
                        var data = {};
                        data.success = false;
                        //data.name="谢谢参与";
                        //data.name = "获取奖品信息失败";
                        data.name = err;
                        res.send(data);
                        return;
                    }
                });
            }else{
                var data = {};
                data.success = false;
                data.name="谢谢参与";
                res.send(data);
                return;
            }
        }
    ])
})

router.post('/confirmWithPhone',function(req,res){
    var postParams=req.body;
    var openId=generalService.decryptoOpenId(postParams.openId);
    var couponCode=postParams.code;
    var userCode=postParams.mobile;
    var merchantCode=postParams.merchantcode;
    var activityId=postParams.activityId;
    resultService.confirmOneCouponWithoutRegister(couponCode,merchantCode,openId,userCode,activityId,function(err,msg){
        console.log(msg);
        if(!err&&msg.status==true){
            var data = {};
            data.success = true;
            //data.name="谢谢参与";
            data.msg = "领取成功";
            res.send(data);
        }else{
            var data = {};
            data.success = false;
            //data.name="谢谢参与";
            data.msg = err;
            res.send(data);
        }
    });

})

module.exports = router;