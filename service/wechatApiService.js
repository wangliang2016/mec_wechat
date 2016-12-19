var wechat_userDAO        = require('../dao/wechat_userDAO');
var pbkdf2                  = require('../security/pbkdf2');
var request=        require('request');
var myLogger                = require('../logging/contextLogger')("web/loginService");

exports.getUser=function(usercode,cb){
    wechat_userDAO.queryOne({where:{USERCODE:usercode}},function(err,msg){
        cb(err,msg);
    })
}
exports.getAccessToken=function(appid,appsecret,cb){
    var reqUrl='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+appsecret;
    var options = {
        method: 'get',
        url: reqUrl
    };
    var access_token;
    request.get(options.url,function(error,response,body){
        if(!error&&response.statusCode==200){
            var tmp=JSON.parse(body);
            access_token=tmp.access_token;
            cb(null,tmp);
        }else{
            cb(error,null);
        }
    })

};