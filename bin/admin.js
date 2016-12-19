//var wechatSSL      = require('../wechatSSL');
var wechat      = require('../wechat');
//var https           = require('https');
var http           = require('http');
//var ssl             = require('../security/ssl');
var node_env       = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
var portConfig     = require('../config/portConfig')[node_env];
var contextLogger = require('../logging/contextLogger');

wechat.set('port', portConfig["wechat"]);
var server = wechat.listen(wechat.get('port'), function() {
    var myLogger=contextLogger("http");
    myLogger.trace('Express wechat server listening on port ' + portConfig["wechat"]);
});
