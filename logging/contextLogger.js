
var node_env        = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
var logConfig          = require('../config/logConfig.json')[node_env];
var log4js = require('log4js');
var fs = require('fs');

if (!fs.existsSync(logConfig["contextLogPath"].replace("\context.log",""))) fs.mkdirSync(logConfig["contextLogPath"].replace("\context.log",""));

logErr=function(err){
    return JSON.stringify(err)+((err&&err.stack)?('\n'+err.stack.toString()):'');
}

//test config
//log4js.configure({
//    appenders: [
//        {
//            type: 'console' //控制台输出
////            layout: {
////                type: 'pattern',
////                pattern: "[%r] [%[%5.5p%]] - %h %c %m%n"
////            }
//        }
//    ],
//    replaceConsole: true
//});


//qa config
log4js.configure({
    appenders: [
        {
            type: 'console' //控制台输出
        },
        {
            type: 'dateFile',
            filename: logConfig["contextLogPath"],
            layout: {type:'basic'},
            pattern: '.yyyy-MM-dd',
            alwaysIncludePattern: true
//            category: 'cheese'
        },
        {
            type: 'file', //文件输出
            filename: logConfig["contextLogPath"],
            maxLogSize: 1024*1024*64,
            backups:1024
//            category: ['normal','console','mysql']
        }
    ],
    replaceConsole: true
});


//prod config
//log4js.configure({
//    appenders: [
//        {
//            type: 'file', //文件输出
//            filename: logConfig["contextLogPath"],
//            maxLogSize: 1024*512,
//            backups:3
//        }
//    ],
//    replaceConsole: true
//});


module.exports=function(name,level){
    var logger = log4js.getLogger(name);
    logger.setLevel(level);
    return logger;
};