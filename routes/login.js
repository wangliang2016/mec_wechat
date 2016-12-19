var express             = require('express');
var loginService        = require('../service/loginService');
var router              = express.Router();
var myLogger            = require('../logging/contextLogger')("web/loginRouter");
var fs                  = require("fs");
var crypto              = require('crypto');
var pbkdf2               = require('../security/pbkdf2');
var auth                =require('../security/auth');
var session =require('express-session');

router.get('/', auth.loginAuthority,function(req, res) {
    res.render('login');
});
router.get('/login',auth.authority, function(req, res) {
    res.redirect('/main');
});
router.post('/login', function(req, res) {
    myLogger.trace("post [/login]: "+JSON.stringify(req.body));
    var usercode = req.body.username;
    var pwd = req.body.password;
    loginService.dologin(usercode,pwd,function(err,user){
        myLogger.trace("post [/login]: "+JSON.stringify(user));
        if(!err && user) {
            req.session.usercode = user.USERCODE;
            req.session.role = user.ROLE;
            req.session.merchantcode = user.MERCHANTCODE;
            req.session.save();
            res.send({status:true,data:"登录成功"});

        }
        else{
            myLogger.warn("post [/login]: "+logErr(err));
            //res.redirect('/');
            res.send({status:false,data:"用户名或密码不正确！"});
        }
    });
});

router.post('/getEncipherPassword',function(req,res){
    var postParams=req.body;
    var password=postParams.password;
    if(password!=null){
        var salt = pbkdf2.generateSaltSync(32);
        var hash = pbkdf2.hashSync(password, salt, 2, 64, 'sha256');
        var result= {"status":1,"Msg":"coupon.public.getEncipherPassword:success","salt":salt,"hash":hash};
        res.send(result);
    }else{
        var result= {"status":0,"Msg":"coupon.public.getEncipherPassword:failed"};
        res.send(result);
    }

});
router.get('/getEncipherPassword',function(req,res){
    var password='123';
    if((password!=null)&&(password!='')){
        var salt = pbkdf2.generateSaltSync(32);
        var hash = pbkdf2.hashSync(password, salt, 2, 64, 'sha256');
        var result= {"status":1,"Msg":"coupon.public.getEncipherPassword:success","salt":salt,"hash":hash};
        res.send(result);
    }else{
        var result= {"status":0,"Msg":"coupon.public.getEncipherPassword:failed"};
        res.send(result);
    }
});
module.exports = router;