var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var async           =require('async');
var exec            = require('child_process').exec;
var myLogger       = require('../logging/contextLogger')("gameService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var wechat_gameDAO=require("../dao/wechat_gameDAO");


exports.getGameAll=function(queryCondition,cb){
    var qry;
    if(!queryCondition){
        qry={};
    }else{
        qry="where:{GAMEDESCRIPT:{$like: '%"+queryCondition+"%'}}";
    }
    wechat_gameDAO.queryAll(qry,function(err,msg){
        if(!err){
            cb(null,msg);
        }
        else{
            cb(err,null);
        }
    });
}