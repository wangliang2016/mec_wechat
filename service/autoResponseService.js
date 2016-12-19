var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var async           =require('async');
var exec            = require('child_process').exec;
var myLogger       = require('../logging/contextLogger')("gameService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var sequelize       = require('../dao/_sequelize');
var wechat_activityDAO=require("../dao/wechat_activityDAO");
var wechat_userDAO=require("../dao/wechat_userDAO");
var generalService        =require('../service/generalService');
var wechat_userDAO=require("../dao/wechat_userDAO");


 function getOneActivityByKeyWords(keyword,cb){
    wechat_activityDAO.queryOne({where:{KEYWORDS:{$like:keyword}},limit:1},function(err,msg){
        if(!err&&msg){
            cb(null,msg);
        }else{
            if(!err&&!msg){
                cb("抱歉，您给出的keyword存在问题",null);
            }else{
                cb(err,null);
            }
        }
    })
}
exports.getOneActivityByKeyWords=getOneActivityByKeyWords;
exports.handle=function(cb){

}