var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring');
var async           =require('async');
var formidable = require('formidable');
var router              = express.Router();
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var gameService        =require('../service/gameService');
var auth        =require('../security/auth');
var myLogger            = require('../logging/contextLogger')("game");

router.get('/allgames',auth.authority,function(req,res){
    res.render('games/allGames');
});

router.get("/getAllGame",auth.authority,function(req,res){
    var queryCondition=null;
    gameService.getGameAll(queryCondition,function(err,msg){
        if(!err&&msg){
            var originData=[];
            originData=msg;
            myLogger.trace("post [/viewOne]: "+JSON.stringify(originData));
            res.send(JSON.stringify(originData));
        }
    })
});

router.get('/gameSetting*',auth.authority,function(req,res){
    res.render('games/'+req.url);
});

router.get('/gameCopySetting*',function(req,res){
    res.render('games/'+req.url);
});

router.get('/gamebegin*',auth.authority,function(req,res){
    var gameCode=req.url.substring(req.url.indexOf('in')+2);
    res.render('games/'+req.url,{"gameCode":gameCode});
});

router.get('/gameModifySetting*',function(req,res){
    var query=qstring.parse(url.parse(req.url).query);
    var activityId=query.activityId;
    var urll=req.url.substring(0,req.url.indexOf('?'));
    res.render('games/'+urll,{"activityId":activityId});
});

router.post('/uploadImg',auth.authority, function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = __dirname + '/../public/upload';
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }
        var image = files.imgFile;
        var path = image.path;
        path = path.replace('/\\/g', '/');
        var url = '/upload/' + path.substr(path.lastIndexOf('\\')+1, path.length-1);
        var info = {
            "error": 0,
            "url": url
        };
        res.send(info);
    });
});


module.exports = router;