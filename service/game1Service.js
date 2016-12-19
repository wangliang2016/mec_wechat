var express        = require('express');
var fs              =require('fs');
var url              =require('url');
var http            =require('http');
var async           =require('async');
var exec            = require('child_process').exec;
var myLogger       = require('../logging/contextLogger')("gameService");
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var wechat_game1DAO=require("../dao/wechat_game1DAO");

exports.queryOneGame=function(gameId,cb){
    if(gameId!=null){
        wechat_game1DAO.queryOne({where:{GAMEID:gameId}},function(err,msg){
            if(!err&&msg){
                cb(null,msg);
            }else{
                if(!err&&!msg){
                    cb("gameId存在错误",null);
                }else{
                    cb(err,null);
                }
            }
        })
    }
}