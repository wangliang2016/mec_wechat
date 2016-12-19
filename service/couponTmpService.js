var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var async           =require('async');
var exec            = require('child_process').exec;
var myLogger       = require('../logging/contextLogger')("couponTmpService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var gameLibConfig=require('../config/gamelibConfig.json')[node_env];
var wechat_coupon_tmpDAO=require("../dao/wechat_coupon_tmpDAO");
var couponService=require('./couponService');
var sequelize       = require('../dao/_sequelize');

exports.addOneTmp=function(couponCode,merchantCode,templateCode,openId,cb) {
    wechat_coupon_tmpDAO.add({COUPONCODE:couponCode,MERCHANTCODE:merchantCode,TEMPLATECODE:templateCode,OPENID:openId},function(err,msg){
        cb(err,msg);
    })
}
exports.deleteOneTmp=function(couponCode,merchantCode,openId,cb) {
    wechat_coupon_tmpDAO.del({where:{COUPONCODE:couponCode,MERCHANTCODE:merchantCode,OPENID:openId}},function(err,msg){
        cb(err,msg);
    })
}
exports.queryOneByTemplateId=function(templateId,cb){
    wechat_coupon_tmpDAO.queryOne({where:{TEMPLATEID:templateId}},function(err,msg){
        cb(err,msg);
    })
}
//其中time以毫秒作为单位,表示显示时间超过当下时间减去time
exports.queryOneByTemplateIdAndTime=function(templateId,time,cb){
    var date=new Date();
    var newdate=new Date(date.getTime()-time);
    wechat_coupon_tmpDAO.queryOne({where:{TEMPLATEID:templateId,updatedAt:{$gte:newdate}}},function(err,msg){
        cb(err,msg);
    })
}

exports.confirmOneCouponTmp=function(couponCode,merchantCode,userCode,userMerchantCode,cb){
    sequelize.transaction({autocommit: false}).then(function (t) {
        async.waterfall([
            function(icb){
                wechat_coupon_tmpDAO.queryOne({where:{COUPONCODE:couponCode,MERCHANTCODE:merchantCode}},t, t.LOCK,function(err,msg){
                    if(!err&&msg){
                        icb(null,true);
                    }else{
                        if(!err&&!msg){
                            icb("该劵已被他人领取",null)
                        }else{
                            icb(err,null);
                        }
                    }
                })
            },
            function(status,icb){
                if(status==true){
                    couponService.modifycoupon(userCode,couponCode,merchantCode,function(err,msg){
                        if(!err&&msg.status){
                            icb(null,true);
                        }else{
                            if(!err&&!msg.status){
                                icb(msg.msg,null);
                            }else{
                                icb(err,null);
                            }
                        }
                    });
                }

            },
            function(status,icb){
                if(status==true){
                    wechat_coupon_tmpDAO.del({where:{COUPONCODE:couponCode,MERCHANTCODE:merchantCode}},t, t.LOCK,function(err,msg){
                       if(!err){
                           icb(null,msg);
                       } else{
                           icb(err,null);
                       }
                    });
                }
            }
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

exports.prepareReceiveOneCouponTmp=function(templateId,times,openId,cb){
    sequelize.transaction({autocommit: false}).then(function (t) {
        async.waterfall([
            function(icb){
                var date=new Date();
                var newdate=new Date(date.getTime()-times);
                wechat_coupon_tmpDAO.queryOne({where:{TEMPLATEID:templateId,updatedAt:{$gte:newdate}}},function(err,msg){
                    if(!err&&msg){
                        icb(null,msg);
                    }else{
                        if(!err&&!msg){
                            icb("临时劵中也没有该类型劵",null);
                        }else{
                            icb(err,null);
                        }
                    }
                })
            },
            function(couponTmpInfo,icb){
                var couponCode=couponTmpInfo.COUPONCODE;
                var merchantCode=couponTmpInfo.MERCHANTCODE;
                wechat_coupon_tmpDAO.update({OPENID:openId},{where:{COUPONCODE:couponCode,MERCHANTCODE:merchantCode}},t, t.LOCK,function(err,msg){
                    if(!err&&msg){
                        icb(null,couponTmpInfo);
                    }else{
                        if(!err&&!msg){
                            icb("该劵已被他人领取",null)
                        }else{
                            icb(err,null);
                        }
                    }
                })
            }
        ],function(err,msg){
            if (!err) {
                t.commit();
                cb(null, msg);
            } else {
                t.rollback();
                cb(err, null);
            }
        })

    });
}
