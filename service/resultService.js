var express        = require('express');
var crypto          =require('crypto');
var fs              =require('fs');
var async              =require('async');
var url              =require('url');
var http            =require('http');
var exec            = require('child_process').exec;
var myLogger       = require('../logging/contextLogger')("resultService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var wechat_subscriberDAO=require("../dao/wechat_subscriberDAO");
var couponService=require("./couponService");
var wechat_subscriber_activityDAO=require("../dao/wechat_subscriber_activityDAO");
var wechat_openid_activityDAO=require("../dao/wechat_openid_activityDAO");
var wechat_activityDAO=require("../dao/wechat_activityDAO");
var wechat_coupon_tmpDAO=require("../dao/wechat_coupon_tmpDAO");
var sequelize       = require('../dao/_sequelize');
var staticConfig=require('../config/staticConfig.json')[node_env];

exports.chooseCoupon=function(coupons){
    //coupons是一个数组[],里面存了它的等级以及概率，status则是选择优惠券的抉择
    var sum=0;
    var probabilitySum=[];
    for(var i=0;i<coupons.length;i++){
        sum+=coupons[i].probability;
    }
    for (var i = 0; i < coupons.length; i++) {
        if (i == 0) {
            probabilitySum[0] = coupons[i].probability;
        } else {
            probabilitySum[i] = coupons[i].probability + probabilitySum[i - 1];
        }
    }
    var getType = Math.ceil(Math.random() * sum);
    for(var i=0;i<coupons.length;i++){
        if ((i == 0 && getType <= probabilitySum[i]) || ((i > 0) && (getType > probabilitySum[i - 1]) && (getType <= probabilitySum[i]))) {
            return i;
        }
    }

}

exports.resultWithRegister=function(subscriberId,templateCode,templateMerchantCode,merchantCode,activityId,num,status,cb){
    sequelize.transaction({autocommit: false}).then(function (t) {
        async.waterfall([
            function(icb){
                wechat_activityDAO.queryOne({where:{ACTIVITYID:activityId}},t, t.LOCK,function(err,msg){
                    if(!err&&msg){
                        icb(err,msg);
                    }else{
                        icb("获取activity信息失败",null);
                    }
                });
            },
            function(activityInfo,icb){
                wechat_subscriberDAO.queryOne({where:{USERID:subscriberId}},t, t.LOCK,function(err,msg){
                    if(!err&&msg){
                        icb(err,activityInfo,msg);
                    }else{
                        icb("获取订阅者用户信息失败",null);
                    }
                })
            },
            function(activityInfo,subscriberInfo,icb){
                console.log(subscriberId);
                var status=false;
                wechat_subscriber_activityDAO.queryOne({where:{USERID:subscriberId,ACTIVITYID:activityId}},t, t.LOCK,function(err,msg){
                    console.log(msg);
                    if(!err&&msg){
                        var subscriberActivityInfo=msg;
                        if(subscriberActivityInfo.PLAYTIMES>subscriberActivityInfo.HAVEPLAYEDNUM){
                            icb(null,subscriberActivityInfo.HAVEPLAYEDNUM,subscriberActivityInfo.PLAYTIMES,activityInfo.ACTIVATIONTIME,subscriberInfo.TELEPHONE,1);
                        }else{
                            icb("Sorry，您的机会已用完",null);
                        }
                    }else{
                        if(!err&&!msg){
                            if(activityInfo.FUNPLAYNUM>0){
                                icb(null,0,activityInfo.FUNPLAYNUM,activityInfo.ACTIVATIONTIME,subscriberInfo.TELEPHONE,0);
                            }else{
                                icb("Sorry,您当前的参与机会次数为0");
                            }
                        }else{
                            if(!err&&!msg){
                                icb("获取activity信息存在错误",null);
                            }else{
                                icb(err,null);
                            }
                        }
                    }
                })
            },
            function(havePlayedTimes,playTimes,activationTime,userCode,playStatus,icb){
                var status=0;
                couponService.distributeCoupon(userCode,templateCode,templateMerchantCode,num,activationTime,status,function(err,msg){
                    console.log(msg);
                    if(!err&&msg.status==true){
                        var somemsg=JSON.parse(msg.msg);
                        //已经成功发劵
                        if(somemsg.status==true) {
                            var couponinfo = somemsg.couponinfo[0];
                            icb(null, havePlayedTimes + num, playTimes, couponinfo,playStatus);
                        }else{
                            icb(somemsg.msg,null);
                        }
                    }else{
                        icb(err,msg);
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

exports.resultWithoutRegister=function(userCode,userMerchantCode,templateCode,templateMerchantCode,merchantCode,activityId,num,activationTime,couponStatus,cb){
        async.waterfall([
            function(icb){
                var status=false;
                wechat_activityDAO.queryOne({where:{ACTIVITYID:activityId}},function(err,msg){
                    if(msg.FUNPLAYNUM>0){
                        status=true;
                        icb(null,status);
                    }else{
                        icb("Sorry,您当前的参与机会次数为0",null);
                    }
                });
            },
            function(status,icb){
                couponService.distributeCoupon(userCode,templateCode,templateMerchantCode,num,activationTime,couponStatus,function(err,msg){
                    if(!err&&msg.status==true){
                        icb(null,msg);
                    }else{
                        if(!err&&(msg.status==false)){
                            if(msg.whetherexceed==true){
                                icb(null,msg);
                            }else{
                                icb(msg.msg,null);
                            }
                        }else{
                            icb(err,null);
                        }
                    }
                })
            }
    ],function(err,msg){
        if(!err){
            console.log(msg);
        }
        cb(err,msg);
    });
}

exports.confirmOneCouponWithoutRegister=function(couponCode,openId,userCode,activityId,cb){
    sequelize.transaction({autocommit: false}).then(function (t) {
        async.waterfall([
            function(icb){
                couponService.activecoupon(userCode,couponCode,openId,function(err,msg){
                    console.log(err);
                    console.log(msg);
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
                                    console.log(len);
                                    async.map(relativeInfo,function(info,fcb){
                                            delete info.OPENID;
                                            info['USERID']=userId;
                                            wechat_subscriber_activityDAO.queryOne({where:{USERID:userId,ACTIVITYID:activityId}},t, t.LOCK,function(err,msg){
                                                if(!err&&msg){
                                                    wechat_subscriber_activityDAO.update(info,{where:{USERID:userId,ACTIVITYID:activityId}},t, t.LOCK,function(err,msg){
                                                        fcb(err,msg);
                                                    })
                                                }else{
                                                    if(!err&&!msg){
                                                        wechat_subscriber_activityDAO.add(info,t,function(err,msg){
                                                            fcb(err,msg);
                                                        })
                                                    }else{
                                                        fcb(err,msg);
                                                    }
                                                }
                                            })
                                        },function(err,msg){
                                        acb(err,msg);
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
                                                //其中msg有值可能是用户玩过两个未激活的游戏，然后前一个游戏已经提交了
                                                acb(err,msg);
                                            }
                                        })
                                    },
                                    function(subscriberInfo,acb){
                                        //通常
                                        wechat_subscriber_activityDAO.queryOne({where:{USERID:subscriberInfo.USERID,ACTIVITYID:activityId}},t,function(err,msg){
                                            if(!err&&msg){
                                                //表示临时openid_activityid没有数据但是subscriber_activity居然有该数据，可能是他之前游戏没提交，又玩另一个游戏造成
                                                acb(null);
                                            }else{
                                                if(!err&&!msg){
                                                    //表示临时openid_activityid没有数据但是subscriber_activity没有有该数据,这是不正常的错误
                                                    wechat_activityDAO.queryOne({where:{ACTIVITYID:activityId}},function(err,msg){
                                                        if(!err&&msg){
                                                            var activityInfo=msg;
                                                            var data=new Date();
                                                            wechat_subscriber_activityDAO.add({USERID:subscriberInfo.USERID,ACTIVITYID:activityInfo.ACTIVITYID,HAVEPLAYEDNUM:1,RECENTPLAYTIME:date,PLAYTIMES:activityInfo.FUNPLAYNUM},t, t.LOCK,function(err,msg){
                                                                acb(err,msg)
                                                            })
                                                        }else{
                                                            acb(err,msg);
                                                        }
                                                    })
                                                }else{
                                                    acb(err);
                                                }

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