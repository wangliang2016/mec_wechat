
var node_env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
var config = require('../config/mysqlConfig.json')[node_env];
var sequelize = require('./_sequelize');


//表同步，只管表是否存在，不管表内字段是否相同
exports.sync = function (cb) {
    sequelize.sync().success(function () {
        cb(null, true);
    }).error(function (err) {
        myLogger.error(err);
        cb(err, null);
    })
}

//执行sql(无论sql中是否加limit1返回始终是数组类型) 注意options必须是{}对象
exports.runSql = function (sql, cb) {
    //if(typeof(options)=='function') {
    //    cb=options;
    //    options=null;
    //}
    //options= options ||{};
    //options.raw=true;
    sequelize.query(sql).then(function (res) {
        cb(null, res);
    },function (err) {
        //myLogger.error(err);
        cb(err, null);
    });
}
