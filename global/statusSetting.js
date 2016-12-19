var activityService        =require('../service/activityService');
var wechat_gameDAO=require("../dao/wechat_gameDAO");
var wechat_activityDAO=require("../dao/wechat_activityDAO");
var interval=300000;
var setCouponStatus=function(){
    //获取的activity是已经开始，且过期时间不超过2小时
    var beginDate=new Date();
    var expireTime=2*60*60*1000;
    var endDate=new Date(beginDate.getTime()-expireTime);
    //wechat_activityDAO.queryAll({where:{BEGINAT:{lte:beginDate},ENDAT:{gte:endDate}}},function(err,msg){
    //})
    //此处一定要建立视图
    wechat_gameDAO.queryAll({attributes:[GAMECODE]},function(err,msg){
        if(!err&&msg){
            console.log()
        }
    })
    var qry="select TEMPLATEID from wechat_activity as activity,wechat_game1 as game1,wechat_game2 as game2 where activity.GAMECODE="
}