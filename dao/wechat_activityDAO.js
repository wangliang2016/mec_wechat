//根据系统环境载入我们的配置
var node_env        = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
var config          = require('../config/mysqlConfig.json')[node_env];
var sequelize       = require('./_sequelize');

var model= require('../model/wechat_activity.json');
var table = sequelize.define('wechat_activity',model,{freezeTableName:true});

exports.table=table;

//查1个
exports.queryOne = function(qry,tran,lock,cb){
    var options={raw:true};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }

    table.find(qry, options).then(function(res){
        cb(null,res);
    },function (err){
        cb(err,null);
    })
}

//查
exports.queryAll = function(qry,tran,lock,cb){
    //var options={raw:true};
    qry.raw=true;
    if(typeof(tran)!='function'){
        if(tran) qry.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) qry.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.findAll(qry).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}

//查并计数全部
exports.queryAndCount = function(qry,tran,lock,cb){
    var options={raw:true};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.findAndCountAll(qry, options).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}

//增
exports.add = function(value,tran,lock,cb){
    var options={};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.create(value).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}

//删
exports.del = function(where,tran,lock,cb){
    var options={};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.destroy(where, options).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}

//改
exports.update = function(value,where,tran,lock,cb){
    var options={};
    if(typeof(tran)!='function'){
        if(tran) options.transaction=tran;
        if(typeof(lock)!='function'){
            if(lock) options.lock=lock;
        }
        else{
            cb=lock;
        }
    } else{
        cb=tran;
    }
    table.update(value, where, options).then(function(res){
        cb(null,res);
    },function (err) {
        cb(err,null);
    })
}
