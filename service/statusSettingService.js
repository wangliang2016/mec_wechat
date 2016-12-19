var express     = require('express');
var async           =require('async');
var router              = express.Router();
var activityService        =require('../service/activityService');
var couponService        =require('../service/couponService');
var generalService        =require('../service/generalService');
var wechat_gameDAO=require("../dao/wechat_gameDAO");
var generalDAO=require("../dao/generalDAO");
var wechat_activityDAO=require("../dao/wechat_activityDAO");

exports.getGame1CouponCodes=function(gameCode,beginDate,endDate,cb) {
    var coupons = [];
    async.waterfall([
        function (icb) {
            var qry = "select activity.ACTIVATIONTIME,game.MODULECOUPON0,game.MODULECOUPON1,game.MODULECOUPON2,game.MODULECOUPON3,game.MODULECOUPON4,game.MODULECOUPON5,game.MODULECOUPON6 from wechat_activity as activity,wechat_game" + gameCode + " as game"
                + " where activity.GAMEID=game.GAMEID and activity.GAMECODE=" + gameCode + " and activity.ACTIVATIONTIME is not null and activity.BEGINAT <= '" + beginDate.Format("yyyy-MM-dd hh:mm:ss") + "' and activity.ENDAT >= '" + endDate.Format("yyyy-MM-dd") + "'";
            generalDAO.runSql(qry, function (err, msg) {
                if (!err && msg) {
                    var results=[];
                    if(msg[0]!=null){
                        for(var i=0;i<msg[0].length;i++){
                            var result={};
                            var couponcodes=[];
                            result.activationTime=msg[0][i].ACTIVATIONTIME;
                            if (msg[0][i].MODULECOUPON0 != null){
                                couponcodes.push(msg[0][i].MODULECOUPON0);
                            }
                            if (msg[0][i].MODULECOUPON1 != null){
                                couponcodes.push(msg[0][i].MODULECOUPON1);
                            }
                            if (msg[0][i].MODULECOUPON2 != null){
                                couponcodes.push(msg[0][i].MODULECOUPON2);
                            }
                            if (msg[0][i].MODULECOUPON3 != null){
                                couponcodes.push(msg[0][i].MODULECOUPON3);
                            }
                            if (msg[0][i].MODULECOUPON4 != null){
                                couponcodes.push(msg[0][i].MODULECOUPON4);
                            }
                            if (msg[0][i].MODULECOUPON5 != null){
                                couponcodes.push(msg[0][i].MODULECOUPON5);
                            }
                            if (msg[0][i].MODULECOUPON6 != null){
                                couponcodes.push(msg[0][i].MODULECOUPON6);
                            }
                            result.couponCodes=couponcodes;
                            results.push(result);
                        }
                        icb(null, results);
                    }
                } else {
                    icb(err);
                }

            })
        },
        function (gameresults, icb) {
            var results = [];
            async.map(gameresults, function (result,fcb) {
                async.map(result.couponCodes,function(couponCode,ffcb){
                    if (couponCode != null && results.indexOf(couponCode) == -1) {
                        var activationTime = result.activationTime;//精确到秒
                        var date = new Date();
                        var datelimit = new Date(date.getTime() - activationTime * 1000);
                        if(couponCode.indexOf('&')){
                            var couponcode=couponCode.split('&')[0];
                            var merchantcode=couponCode.split('&')[1];
                            var condition = {
                                templatecode: couponcode,
                                templatemerchantcode:merchantcode,
                                status: 2,
                                createtime: {
                                    comp: 2,
                                    date: datelimit.Format("yyyy-MM-dd hh:mm:ss")
                                }
                            };
                            couponService.querycouponinstance(condition, function (err, msg) {
                                if (!err&&msg) {
                                    var codes=JSON.parse(msg).couponcodes;
                                    if (codes != null) {
                                        for (var i = 0; i < codes.length; i++) {
                                            results.push(codes[i]);
                                        }
                                        ffcb(null,codes)
                                    }
                                }else{
                                    icb(err);
                                }
                            })
                        }
                    }
                },function(err,msg){
                    if(!err&&msg){
                        var results=[];
                        for(var i=0;i<msg.length;i++){
                            for(var j=0;j<msg[i].length;j++){
                                results.push(msg[i][j]);
                            }
                        }
                        fcb(err,results);
                    }else{
                        fcb(err,null);
                    }
                })
            },function(err,msg){
                if(!err&&msg){
                    var results=[];
                    for(var i=0;i<msg.length;i++){
                        for(var j=0;j<msg[i].length;j++){
                            results.push(msg[i][j]);
                        }
                    }
                    icb(err,results);
                }else{
                    icb(err,null);
                }
            })
        },
        function(couponCodes,icb){

        },
        function(couponCodes,icb){
            if(couponCodes!=null&&couponCodes.length!=0){
                couponService.invalidcoupon(couponCodes,function(err,msg){
                    icb(err,msg);
                })
            }
        }
    ], function (err, msg) {
        cb(err,msg);
    });
}