var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var async           =require('async');
var exec            = require('child_process').exec;
var myLogger       = require('../logging/contextLogger')("gameService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var securityService=require('../security/securityService');
var couponService        =require('../service/couponService');
var staticConfig=require('../config/staticConfig.json')[node_env];
var couponConfig=require('../config/couponConfig.json')[node_env];
var httpsUtil     =require('../interaction/httpsRequest');
var wechat_subscriberDAO=require("../dao/wechat_subscriberDAO");
var sequelize       = require('../dao/_sequelize');

exports.queryActiveCouponInfoByUsercode=function(openId,cb){
    wechat_subscriberDAO.queryOne({where:{OPENID:openId}},function(err,msg){
        if(!err&&msg){
            if(msg.TELEPHONE!=null){
                var date=new Date();
                var  condition={
                    usercode: msg.TELEPHONE,
                    endat:{
                        comp:1,
                        date:date
                    }
                };
                couponService.querycouponinstanceinfo(condition,function(err,msg){
                    if(!err){
                        cb(null,{status:true,coupons:msg});
                    }else{
                        cb(err,null);
                    }
                })
            }else{
                cb(null,{status:true,coupons:[]});
            }
        }else{
            if(!err&&!msg){
                var date=new Date();
                var  condition={
                    usercode: openId.toString(),
                    status:2,
                    endat:{
                        comp:1,
                        date:date
                    }
                };
                couponService.querycouponinstanceinfo(condition,function(err,msg){
                    if(!err){
                        cb(null,{status:false,coupons:msg});
                    }else{
                        cb(err,null);
                    }
                })
            }else{
                cb(err,null);
            }
        }
    })

}

exports.queryActiveCouponByUsercode=function(openId,cb){
    var date=new Date();
    var  condition={
        usercode: openId.toString(),
        status:2,
        endat:{
            comp:1,
            date:date
        }
    };
    couponService.querycouponinstanceinfo(condition,function(err,msg){
        if(!err){
            cb(null,msg);
        }else{
            cb(err,null);
        }
    })
}

exports.confirmOneCouponWithoutRegister=function(couponCode,openId,userCode,cb){
    sequelize.transaction({autocommit: false}).then(function (t) {
        async.waterfall([
            function(icb){
                //需要将所有用户的优惠券都激活
                couponService.activecoupon(userCode,couponCode,openId,function(err,msg){
                    if(!err&&msg){
                        icb(null,true);
                    }else{
                        icb(err,null);
                    }
                });
            },
            function(status,icb){
                if(status==true){
                    wechat_openid_activityDAO.queryAll({where:{OPENID:openId}},t,function(err,msg){
                        if(!err&&msg){
                            var relativeInfo=msg;
                            async.waterfall([
                                function(acb){
                                    wechat_subscriberDAO.queryOne({where:{OPENID:openId}},t,function(err,msg){
                                        if(!err&&!msg){
                                            wechat_subscriberDAO.add({ROLE:1,TELEPHONE:userCode,OPENID:openId},t, t.LOCK,function(err,msg){
                                                acb(err,msg.USERID);
                                            })
                                        }else{
                                            if(!err&&msg){
                                                var userId=msg.USERID;
                                                wechat_subscriberDAO.update({TELEPHONE:userCode},{where:{OPENID:openId}},t, t.LOCK,function(err,msg){
                                                    acb(err,userId);
                                                })
                                            }else{
                                                acb(err,msg);
                                            }
                                        }
                                    })
                                },
                                function(userId,acb){
                                    var qry={};
                                    var i=0;
                                    var len=relativeInfo.length;
                                    async.until(
                                        function () {
                                            return i >= len;
                                        },
                                        function(ucb){
                                            delete relativeInfo[i].OPENID;
                                            relativeInfo[i]['USERID']=userId;
                                            var relativeInfoNow=relativeInfo[i];
                                            wechat_subscriber_activityDAO.queryOne({where:{USERID:userId,ACTIVITYID:relativeInfo[i].ACTIVITYID}},t, t.LOCK,function(err,msg){
                                                if(!err&&msg){
                                                    wechat_subscriber_activityDAO.update(relativeInfo[i],{where:{USERID:userId,ACTIVITYID:relativeInfo[i].ACTIVITYID}},t, t.LOCK,function(err,msg){
                                                        acb(err,msg);
                                                    })
                                                }else{
                                                    if(!err&&!msg){
                                                        wechat_subscriber_activityDAO.add(relativeInfo[i],t,function(err,msg){
                                                            acb(err,msg);
                                                        })
                                                    }else{
                                                        acb(err,msg);
                                                    }
                                                }
                                            })
                                        })
                                },
                                function(samsg,acb){
                                    wechat_openid_activityDAO.del({where:{OPENID:openId}},t,function(err,msg){
                                        acb(err,samsg);
                                    })
                                }
                            ],function(err,msg){
                                icb(err,msg);
                            })
                        }else{
                            //此处为用户再上一次提交手机密码时已经将之前玩过的游戏信息一起带到subscriber_activity那张表了
                            if(!err&&!msg){
                                async.waterfall([
                                    function(acb){
                                        wechat_subscriberDAO.queryOne({where:{OPENID:openId}},t,function(err,msg){
                                            if(!err&&!msg){
                                                wechat_subscriberDAO.add({ROLE:1,TELEPHONE:userCode,OPENID:openId},t, t.LOCK,function(err,msg){
                                                    acb(err,msg);
                                                })
                                            }else{
                                                //其中msg有值可能是用户玩过两个未激活的游戏，然后前一个游戏已经提交了,msg中有值为正常情况
                                                acb(err,msg);
                                            }
                                        })
                                    }
                                ],function(err,msg){
                                    icb(err,msg)
                                })
                            }else{
                                icb(err,null);
                            }

                        }
                    })
                }

            },

        ],function(err,msg){
            if (!err) {
                t.commit();
                cb(null, {status: true});
            } else {
                t.rollback();
                cb(err, null);
            }
        })
    });
}