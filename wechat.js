var wechat      = require('wechat');
var path        = require('path');
var express     = require('express');
var bodyParser      = require('body-parser');
var cookieParser =require('cookie-parser');
var session =require('express-session');
var ejs     =require('ejs');
var app         = express();
var mainRoutes          = require('./routes/main');
var gamesRoutes          = require('./routes/games');
var gameTemplateRoutes          = require('./routes/gametemplate');
var couponRoutes          = require('./routes/coupon');
var activityRoutes          = require('./routes/activity');
var autoResponseRoutes          = require('./routes/autoResponse');
var subscriberRoutes          = require('./routes/subscriber');
var gameResultRoutes          = require('./routes/gameresult');
var testRoutes          = require('./routes/test');
var statusSetting          = require('./routes/statusSetting');
var personalCouponRoutes          = require('./routes/personalCoupon');
var wechatApiTestRoutes          = require('./routes/wechatApiTest');
var routes          = require('./routes/login');

//视图引擎设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
//app.use(session({
//    resave: true, // don't save session if unmodified
//    saveUninitialized: false, // don't create session until something stored
//    secret: 'love'
//}));
//app.use(session({
//    cookie: { maxAge: 60 * 1000 },
//    resave: true, // don't save session if unmodified
//    saveUninitialized: false, // don't create session until something stored
//    secret: 'keyboard cat'
//}));
app.use(session({secret: 'heddyking',resave:{},saveUninitialized:{}}));//secret是必须的https://github.com/expressjs/session

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'controllers')));
app.use('/', routes);
app.use('/main', mainRoutes);
app.use('/gametemplate', gameTemplateRoutes);
app.use('/games', gamesRoutes);
app.use('/coupon', couponRoutes);
app.use('/activity', activityRoutes);
app.use('/autoresponse', autoResponseRoutes);
app.use('/subscriber', subscriberRoutes);
app.use('/gameresult', gameResultRoutes);
app.use('/test', testRoutes);
app.use('/personalcoupon', personalCouponRoutes);
app.use('/wechatapi', wechatApiTestRoutes);

/// catch 404 and forward to error handler
////登录拦截器
//app.use(function (req, res, next) {
//    var url = req.originalUrl;
//    if (url != "/" && !req.session.usercode) {
//        return res.redirect("/");
//    }
//    next();
//});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

statusSetting.setStatusInterval();
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

//production error handler
//no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports=app;