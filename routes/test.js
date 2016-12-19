var express             = require('express');
var path                =require('path');
var url                =require('url');
var fs                =require('fs');
var qstring         =require('querystring')
var router              = express.Router();
var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var httpsUtil     =require('../interaction/httpsRequest');

router.get('/test',function(req,res){
    res.render('test');
});
router.post('/test',function(req,res){

    var finaldata ={};
    finaldata.usercode = '000000';
    finaldata.templatecode ="09080720";
    finaldata.templatemerchantcode = "20020";
    finaldata.merchantcode = "20020";
    finaldata.usermerchantcode = "20020";
    console.log(JSON.stringify(finaldata));
    var data=JSON.stringify(finaldata);
    var options = {
        hostname: '127.0.0.1',
        port: 7001,
        path: '/couponinstance/distributecoupon',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        },
        method: 'POST',
        post_data:data,
        token: {
            'user': 'rulecreator1',
            'pass': '2',
            'sendImmediately': true
        }
        //post_data:null
    };

    httpsUtil(options,function(err,msg){
        if(!err){
            console.log(msg);
        }else{
            console.log(err);
        }
    })

});
module.exports = router;