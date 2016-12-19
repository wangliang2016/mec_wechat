function getLength(str){
    return str.replace(/[^\x00-xff]/g,"xx").length;  //\x00-xff 此区间是单子节 ，除了此区间都是双字节。
}
function findStr(str,n){
    var tmp=0;
    for(var i=0;i<str.length;i++){
        if(str.charAt(i)==n){
            tmp++;
        }
    }
    return tmp;
}
window.onload=function(){
    var aInput=document.getElementsByTagName('input');
    var oName=aInput[0];
    var dx=aInput[1];
    var pwd=aInput[3];
    var pwd2=aInput[4];
    
    var aP=document.getElementsByTagName('p');
    var name_msg=aP[0];
    var dx_msg=aP[0];
    var pwd_msg=aP[0];
    var pwd2_msg=aP[0];
    var name_length=0;
    var sendWhether=true;
    var phoneWhether=true;
    var send=document.getElementById('send'),
	    times=60,
	    timer=null;
	    send.onclick=function(){      
	      // 计时开始 
            timer = setInterval(djs,1000);
            if(times>0&&phoneWhether){
                $.ajax({
                    url: '/personalcoupon/getTelCode',
                    type: 'get',
                    data: {TELEPHONE:$('#phone').val()},
                    dataType: 'html',
                    timeout: 10000,
                    error: function (err) {
                        alert("网络存在问题，待会" + JSON.stringify(err));
                    },
                    success: function (msg) {

                    }
                })
                sendWhether=false;
            }
	    } 
        function djs(){
    		send.value = times+"秒后重试";
			send.setAttribute('disabled','disabled');
            send.style.background='#ccc';
            send.style.border='1px solid #ccc';
			times--;
			if(times <= 0){
				send.value = "发送验证码";
				send.removeAttribute('disabled');
				times = 60;
				clearInterval(timer);
                sendWhether=true;
			}
		}
    
    
    //用户名检测
    
    oName.onfocus=function(){
        name_msg.style.display='block';
        oName.removeAttribute("placeholder");
        oName.style.border='1px solid #fff';
        name_msg.innerHTML='';
    }
       
    oName.onblur=function(){
        // 含有非法字符 ，不能为空 ，长度少于5个字符 ，长度大于25个字符
        var tel = /^1[3|4|5|7|8][0-9]\d{8}$/;
        if(!tel.test(this.value)){
            name_msg.innerHTML='<i>手机号不正确</i>';
            oName.style.border='1px solid red';
            phoneWhether=false;
        }
        else{
            oName.style.border='1px solid #fff';
        }
    }
    
    //短信验证码检测
    
    dx.onfocus=function(){
        dx_msg.style.display='block';
        dx.removeAttribute("placeholder");
        dx.style.border='1px solid #fff';
    }
        
}







































