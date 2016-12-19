
exports.loginAuthority=function(req,res,next){
    if (!checkAuthenticate(req)) {
        next();
    }
    else{
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        var html = '<html><body> <script> top.location.href="/main";</script></body></html>';
        res.end(html);
    }
}
exports.authority = function(req, res, next){
    if (!checkAuthenticate(req)) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        var html = '<html><body> <script> top.location.href="/";</script></body></html>';
        res.end(html);
    }
    else{
        next();
    }
}
var checkAuthenticate = function(req){
    if (!req.session.usercode) {
        return false;
    }
    else{
        return true;
    }
}