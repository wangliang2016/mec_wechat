var node_env        = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
var smsConfig       = require('../config/smsConfig.json')[node_env];
var httpRequest     = require('../interaction/httpRequest');
var wechat_subscriberDAO=require("../dao/wechat_subscriberDAO");
var generalService = require('../service/generalService');
var myLogger = require('../logging/contextLogger')("smsService");
var objectUtil = require('../util/objectUtil');
var tokenID="7100105830590823";

exports.sendTelCode = function (telephone,code, cb) {
    wechat_subscriberDAO.queryOne({ where: {"TELEPHONE": telephone}}, function (err, msg) {
            if (!err) {
                if(!msg){
                        console.log(telephone);
                        console.log(code);
                        sendSMS(telephone, 8, "注册验证码：" + code, "2015-1-1", function (err, msg) {
                        cb(err, msg);
                    })
                }
                else{
                    myLogger.trace("sendTelCode [" + telephone + "]: 该手机号已被注册");
                    cb("该手机号已被注册",null);
                }
            }
            else{
                myLogger.trace("sendTelCode [" + telephone + "]: 系统错误");
                cb("系统错误",null);
            }
        });

}
function sendSMS(mobile,formatid,content,scheduledate,cb){
    //console.log(config);
    var config=objectUtil.clone(smsConfig);
    config.path=config.path+"SendSMS?mobile="+mobile+"&FormatID="+formatid+"&Content="+content+"&ScheduleDate="+scheduledate+"&TokenID="+tokenID;
    config.method="get";

    httpRequest(config,function(err,msg){
            cb(err,msg);
    })
}

exports.sendSMS=sendSMS;

