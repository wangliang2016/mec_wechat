var jwt = require('jwt-simple');
var iconv=require("iconv-lite");
var crypto=require('crypto');
var fs = require('fs');

var getSign=function(serverPrivateKey,sign_type,content){
    //除去待签名参数数组中的空值和签名参数
    var para_filter = paraFilter(content);
    //对待签名参数数组排序
    var para_sort = argSort(para_filter);
    //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
    var prestr = createLinkstring(para_sort);

    var gbkBytes = iconv.encode(prestr,'utf8');
    var data=gbkBytes;
    var signn=crypto.createSign(sign_type);
    signn.update(data);
    var sig=signn.sign(serverPrivateKey,'base64');
    //console.log(sig);
    return sig;
}
exports.getSign=getSign;

var  paraFilter = function(para){
    var para_filter = new Object();
    for (var key in para){
        if(key == 'sign' || key == 'sign_type' || para[key] == ''){
            continue;
        }
        else{
            para_filter[key] = para[key];
        }
    }

    return para_filter;
}

var argSort = function(para){
    var result = new Object();
    var keys = Object.keys(para).sort();
    for (var i = 0; i < keys.length; i++){
        var k = keys[i];
        result[k] = para[k];
    }
    return result;
}
var createLinkstring = function(para){
    //return qs.stringify(para);
    var ls = '';
    for(var k in para){
        ls = ls + k + '=' + para[k] + '&';
    }
    ls = ls.substring(0, ls.length - 1);
    return ls;
}
