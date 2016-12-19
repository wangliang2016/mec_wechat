var http            =require('http');
var contextLogger   =require('../logging/contextLogger');
var myLogger=contextLogger("httpRequest","TRACE");
var fs              = require('fs');

module.exports=function(config,callback){
    config.hostname=config.hostname?config.hostname:'localhost';
    config.port=config.port?config.port:3000;

    if(config.method.toUpperCase()=="POST" && config.post_data) {
        config.headers = config.headers?config.headers:{
            "Content-Type": 'application/json',
            "Content-Length": config.post_data.length,
            "Charset" : "utf8"
        };
    }

    // 请求5秒超时
    var request_timer = setTimeout(function() {
        req.abort();
        console.log('Request Timeout.');
    }, 5000);

    var req = http.request(config, function(res) {
        clearTimeout(request_timer);
        // 等待响应60秒超时
        var response_timer = setTimeout(function() {
            res.destroy();
            console.log('Response Timeout.');
        }, 5000);

        myLogger.trace('STATUS: ' + res.statusCode);
        myLogger.trace('HEADERS: ' + JSON.stringify(res.headers));
        myLogger.trace('Request: ' + config.hostname+":"+(config.port||80)+(config.path||"/"));
        res.setEncoding('utf8');
        var data="";
        res.on('data', function (chunk) {
            data+=chunk;
        });

        res.on('end',function(){
            clearTimeout(response_timer);
            myLogger.trace("FINISH http request "+ (data.replace(/\s+/g, "")).substring(0,20) + data);
            callback(null,data);
        })
    });

    req.on('error', function(e) {
        myLogger.warn('problem with request: ' + e.message);
        callback(e,null);
    });

    if(config.post_data){
        req.write(config.post_data + "\n");
    }
    req.end();
}