var wechat_userDAO        = require('../dao/wechat_userDAO');
var pbkdf2                  = require('../security/pbkdf2');
var myLogger                = require('../logging/contextLogger')("web/loginService");

//登录验证与session处理
exports.dologin = function(usercode,pwd,cb){
    myLogger.trace("dologin [usercode]: "+usercode);
    //检查验证码
//    if(requestCcaptxt.toLowerCase()!=sessionCcaptxt.toLowerCase()){
//        cb("验证码不正确",null);
//        return;
//    }
    exports.checkUser(usercode,pwd,function(err,user){
        if(!err){
            cb(null,user);
        }
        else{
            cb(err,null);
        }
    });
};


//检测是否为合法用户
exports.checkUser = function (usercode,pwd,cb){
    wechat_userDAO.queryOne({
        attributes:['USERCODE','ROLE','MERCHANTCODE','HASH','SALT'],
        where:{"NAME":usercode}
        },function(err,msg){
        if(!err){
            myLogger.trace("checkUser [ wechat_userDAO.queryOne]: "+JSON.stringify(msg));
            if(msg) {
                var hash=msg["HASH"];
                var salt=msg["SALT"];
                var realHash=pbkdf2.hashSync(pwd, salt, 2, 64, 'sha256');
                myLogger.trace("checkUser [realHash]: "+realHash);
                if(realHash==hash){
                    delete msg.HASH;
                    delete msg.SALT;
                    cb(null,msg);
                }
                else{
                    cb("密码存在错误",null);
                }
            }
            else{
                cb("抱歉输入的用户名存在错误",null);
            }
        }
        else{
            myLogger.error("checkUser [mec_adm_adminDAO.queryOne]: "+logErr(err));
            cb(err,null);
        }
    });
}
