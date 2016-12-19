var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring');
var async           =require('async');
var formidable = require('formidable');
var router              = express.Router();
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';

router.get('/*',function(req,res){
    var uri=url.parse(req.url).pathname;
    var filename=path.join(process.cwd(),"../security/"+uri);
    console.log(filename);
    fs.exists(filename,function(exists){
        if(!exists){
            res.send("404 Not Found\n");
            return;
        }
        fs.readFile(filename,'utf-8',function(err,file){
            if(err){
                res.send(err+"/n");
                return;
            }
            res.send(file);
        });
    });
});

module.exports = router;
