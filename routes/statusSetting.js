var express     = require('express');
var async           =require('async');
var router              = express.Router();
var activityService        =require('../service/activityService');
var couponService        =require('../service/couponService');
var statusSettingService        =require('../service/statusSettingService');
var generalService        =require('../service/generalService');
var wechat_gameDAO=require("../dao/wechat_gameDAO");
var generalDAO=require("../dao/generalDAO");
var wechat_activityDAO=require("../dao/wechat_activityDAO");
var interval=900000;

var setCouponStatus=function(){
//router.get('/setCouponStatus',function(req,res){
    //获取的activity是已经开始，且过期时间不超过2小时
    var beginDate=new Date();
    var expireTime=24*60*60*1000;
    var endDate=new Date(beginDate.getTime()-expireTime);
    var codes=[];
    //wechat_activityDAO.queryAll({where:{BEGINAT:{lte:beginDate},ENDAT:{gte:endDate}}},function(err,msg){
    //})
    //此处一定要建立视图
    //对于不同的游戏需要写不同的方法
    async.waterfall([
        function(icb){
            wechat_gameDAO.queryAll({attributes:['GAMECODE'],where:{GAMEROLE:0}},function(err,msg){
                if(!err&&msg){
                    for(var i=0;i<msg.length;i++){
                        codes.push(msg[i].GAMECODE);
                    }
                    codes.forEach(function(gameCode){
                        if(gameCode==1){
                            statusSettingService.getGame1CouponCodes(gameCode,beginDate,endDate,function(err,msg){
                                if(err){
                                    console.log(err);
                                }
                            });

                        }
                    })

                }
            })
        }
    ])

};
exports.setStatusInterval=function(){
    setInterval(function () {
        setCouponStatus();
        console.log("test");
    },interval);
}