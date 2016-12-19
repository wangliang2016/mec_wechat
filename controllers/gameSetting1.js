var mymodule=angular.module('ews',[]);
mymodule.controller('activitySettingcontrl',['$scope','$rootScope','$http',function ($scope,$rootScope,$http) {
    $scope.couponTemplateInfos=[];
    var editor;
    KindEditor.ready(function(K){
        var options={
            cssPath:'../lib/kindeditor-4.1.10/plugins/code/prettify.css',
            filterMode:true,
            allowImageUpload:true,
            uploadJson:'/games/uploadImg',
            afterUpload: function(){this.sync();}, //图片上传后，将上传内容同步到textarea中
            afterBlur: function(){this.sync();}   ////失去焦点时，将上传内容同步到textarea中
        };
        editor= K.create('textarea[name="activity_content"]',options);
        window.editor= K.create("#activity_editor_content");
    });
    $scope.ruleName="刮刮卡";
    $scope.keyWords="刮刮卡";
    $scope.startTitle="刮刮卡活动开始了";
    $scope.startPicUrl="/upload/upload_73c3bcc1c267bbf8046368576c824173.jpg";
    $scope.activityIntroduction="欢迎参加刮刮卡抽奖";
    $scope.activityContent="亲，请点击进入刮刮卡抽奖活动页面，祝您好运哦！";
    $scope.repeatWords="亲，继续努力哦！";
    $scope.ticketInformation="兑奖请联系我们，电话13899999999";
    $scope.lotteryBackgroundUrl="/upload/upload_ba4a576c73910c874a10280d1762c2a9.jpg";
    $scope.lotteryWordsUrl="/upload/upload_c68085c149b5ff3783d465b1f96ba630.png";
    $scope.verificationWords="请输入任意6位数";
    $scope.endTitle="刮刮卡活动已经结束了";
    $scope.endPicUrl="/upload/upload_6c17f89358e91fff606ec9a0fb78f766.jpg";
    $scope.endIntroduction="亲，活动已经结束，请继续关注我们的后续活动哦。";
    $scope.focusLink="输入关注该微信号的链接";
    $scope.shareTitle="欢迎参加刮刮卡活动";
    $scope.sharePicUrl="/upload/upload_73c3bcc1c267bbf8046368576c824173.jpg";
    $scope.shareIntroduction="亲，欢迎参加刮刮卡抽奖活动，祝您好运哦！！ 亲，需要绑定账号才可以参加哦";
    //$scope.activityInfo.ADLINK = $scope.adLink;
    //$scope.activityInfo.SHARELINK = $scope.shareLink;
    //$scope.activityInfo.ADPIC = $scope.merchantPicUrl;
    var date=new Date();
    var endDate=new Date();
    endDate.setDate(endDate.getDate()+1);
    $('#beginTime').val(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDay());
    $('#endTime').val(endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDay());
    //$scope.fullDate=$scope.startTime+"至"+$scope.endTime;
    //console.log($scope.fullDate);
    $scope.prizeUpper=1;
    $scope.playNumUpper=1;
    $scope.funPrize=1;
    $scope.shareNum=1;
    $scope.activationTime=3600;

    $http({
        url:'../coupon/getEffectiveCouponTemplate',
        method:"GET",
        headers: {
            'Content-Type': "application/json;charset=UTF-8"
        }
    })
        .success(function(data){
            if(data.status==true){
                $scope.couponTemplateInfos=JSON.parse(data.msg).templateinfos;
                var contentInfos=[];
                console.log()
                if(data.msg!=null){
                    for(var i=0;i<$scope.couponTemplateInfos.length;i++){
                        $scope.couponTemplateInfos[i].showInfo=$scope.couponTemplateInfos[i].TEMPLATECODE.toString()+" "+$scope.couponTemplateInfos[i].TEMPLATECONTENT.toString();
                    }
                    $scope.couponTemplateSimpleInfos=$scope.couponTemplateInfos;
                }else{
                    $scope.couponTemplateSimpleInfos=['目前为止并没有创建有效的优惠券'];
                }
            }else{
                alert(data.msg);
            }
        })
        .error(function(data){
            alert(data);
        });

    $scope.submitOneActivity=function(){
        var sum=0;
        if($scope.probability1!=null){
            var c_rate_one=$scope.probability1;
            sum=sum+parseInt(c_rate_one);
            console.log(sum);
        }
        if($scope.probability2!=null) {
            var c_rate_two = $scope.probability2;
            sum=sum+parseInt(c_rate_two);
            console.log(sum);
        }
        if($scope.probability3!=null) {
            var c_rate_three = $scope.probability3;
            sum=sum+parseInt(c_rate_three);
            console.log(sum);
        }
        if($scope.probability4!=null) {
            var c_rate_four = $scope.probability4;
            sum=sum+parseInt(c_rate_four);
            console.log(sum);
        }
        if($scope.probability5!=null) {
            var c_rate_five = $scope.probability5;
            sum=sum+parseInt(c_rate_five);
            console.log(sum);
        }
        if($scope.probability6!=null) {
            var c_rate_six = $scope.probability6;
            sum=sum+parseInt(c_rate_six);
            console.log(sum);
        }
        if($scope.probability7!=null) {
            var c_rate_seven = $scope.probability7;
            sum=sum+parseInt(c_rate_seven);
            console.log(sum);
        }
        console.log(sum);
        if(sum!=100){
            alert("设置奖品的总概率请为100");
            return;
        }
        $scope.activityInfo={};
        $scope.activityInfo.NAME = $scope.ruleName;
        $scope.activityInfo.KEYWORDS = $scope.keyWords;
        $scope.activityInfo.STARTTITLE = $scope.startTitle;
        $scope.activityInfo.STARTPIC = $('#upload-image-url-start_picurl').val();
        $scope.activityInfo.STARTINTRO = $scope.activityIntroduction;
        $scope.activityInfo.INTRODUCTION = editor.html();
        $scope.activityInfo.REPEATRESPONSE = $scope.repeatWords;
        $scope.activityInfo.AUCTIONINFO = $scope.ticketInformation;
        $scope.activityInfo.LOTTERYBACKGROUND = $('#upload-image-url-lottery_background').val();
        $scope.activityInfo.LOTTERYWORD = $('#upload-image-url-adimg').val();
        $scope.activityInfo.VERIFICATIONCODE = $scope.verificationWords;
        $scope.activityInfo.ENDTITLE = $scope.endTitle;
        $scope.activityInfo.ENDPIC = $('#upload-image-url-end_picurl').val();
        $scope.activityInfo.ENDINTRO = $scope.endIntroduction;
        $scope.activityInfo.FOCUSLINK = $scope.focusLink;
        $scope.activityInfo.SHARETITLE = $scope.shareTitle;
        $scope.activityInfo.SHAREPIC =  $('#upload-image-url-share_img').val();
        $scope.activityInfo.SHAREINTRO = $scope.shareIntroduction;
        $scope.activityInfo.ADLINK = $scope.adLink;
        //$scope.activityInfo.SHARELINK = $scope.shareLink;
        $scope.activityInfo.ADPIC = $('#upload-image-url-merchant_logo').val();
        //$scope.activityInfo.BEGINAT = $scope.startTime;
        //$scope.activityInfo.ENDAT = $scope.endTime;
        $scope.activityInfo.BEGINAT = $("#beginTime").val()+" 00:00:00";
        $scope.activityInfo.ENDAT = $("#endTime").val()+" 00:00:00";
        $scope.activityInfo.GAMECODE = 1;
        $scope.activityInfo.UPPERPRIZENUM = $scope.prizeUpper;
        $scope.activityInfo.UPPERPLAYNUM = $scope.playNumUpper;
        $scope.activityInfo.FUNPLAYNUM = $scope.funPrize;
        $scope.activityInfo.SHARENUM = $scope.shareNum;
        //增加session之后需要修改usercode
        if($scope.activationTime==null||isNaN($scope.activationTime)){
                $scope.activationTime=null;
        }else{
            $scope.activityInfo.ACTIVATIONTIME=$scope.activationTime;
        }

        //下面是游戏部分的设置（当前系统不考虑实物）
        $scope.activityInfo.MODULETITLE0 = $scope.awardType1;
        $scope.activityInfo.MODULETITLE1 = $scope.awardType2;
        $scope.activityInfo.MODULETITLE2 = $scope.awardType3;
        $scope.activityInfo.MODULETITLE3 = $scope.awardType4;
        $scope.activityInfo.MODULETITLE4 = $scope.awardType5;
        $scope.activityInfo.MODULETITLE5 = $scope.awardType6;
        $scope.activityInfo.MODULETITLE6 = $scope.awardType7;

        if($scope.couponSelect1!=null){
            $scope.activityInfo.MODULEGOODSNUM0 = $scope.couponSelect1.TOTALNUMBER;
        }else{
            $scope.activityInfo.MODULEGOODSNUM0 =null;
        }
        if($scope.couponSelect2!=null){
            $scope.activityInfo.MODULEGOODSNUM1 = $scope.couponSelect2.TOTALNUMBER;
        }else{
            $scope.activityInfo.MODULEGOODSNUM1=null;
        }
        if($scope.couponSelect3!=null){
            $scope.activityInfo.MODULEGOODSNUM2 = $scope.couponSelect3.TOTALNUMBER;
        }else{
            $scope.activityInfo.MODULEGOODSNUM2 =null;
        }
        if($scope.couponSelect4!=null){
            $scope.activityInfo.MODULEGOODSNUM3 = $scope.couponSelect4.TOTALNUMBER
            $scope.activityInfo.MODULEGOODSNUM3 =null;
        }
        if($scope.couponSelect5!=null){
            $scope.activityInfo.MODULEGOODSNUM4 = $scope.couponSelect5.TOTALNUMBER;
        }else{
            $scope.activityInfo.MODULEGOODSNUM4=null;
        }
        if($scope.couponSelect6!=null){
            $scope.activityInfo.MODULEGOODSNUM5= $scope.couponSelect6.TOTALNUMBER;
        }else{
            $scope.activityInfo.MODULEGOODSNUM5 =null;
        }
        if($scope.couponSelect7!=null){
            $scope.activityInfo.MODULEGOODSNUM6 = $scope.couponSelect7.TOTALNUMBER;
        }else{
            $scope.activityInfo.MODULEGOODSNUM6 =null;
        }

        if($scope.couponSelect1!=null){
            $scope.activityInfo.MODULECONTENT0 = $scope.awardName1;
        }else{
            $scope.activityInfo.MODULECONTENT0 =null;
        }
        if($scope.couponSelect2!=null){
            $scope.activityInfo.MODULECONTENT1 = $scope.awardName2;
        }else{
            $scope.activityInfo.MODULECONTENT1=null;
        }
        if($scope.couponSelect3!=null){
            $scope.activityInfo.MODULECONTENT2 = $scope.awardName3;
        }else{
            $scope.activityInfo.MODULECONTENT2 =null;
        }
        if($scope.couponSelect4!=null) {
            $scope.activityInfo.MODULECONTENT3 = $scope.awardName4;
        }else{
            $scope.activityInfo.MODULECONTENT3 =null;
        }
        if($scope.couponSelect5!=null){
            $scope.activityInfo.MODULECONTENT4 = $scope.awardName5;
        }else{
            $scope.activityInfo.MODULECONTENT4=null;
        }
        if($scope.couponSelect6!=null){
            $scope.activityInfo.MODULECONTENT5= $scope.awardName6;
        }else{
            $scope.activityInfo.MODULECONTENT5 =null;
        }
        if($scope.couponSelect7!=null){
            $scope.activityInfo.MODULECONTENT6 = $scope.awardName7;
        }else{
            $scope.activityInfo.MODULECONTENT6 =null;
        }

        if($scope.couponSelect1!=null){
            $scope.activityInfo.MODULECOUPON0 = $scope.couponSelect1.TEMPLATECODE+"&"+$scope.couponSelect1.MERCHANTCODE;
        }else{
            $scope.activityInfo.MODULECOUPON0 =null;
        }
        if($scope.couponSelect2!=null){
            $scope.activityInfo.MODULECOUPON1 = $scope.couponSelect2.TEMPLATECODE+"&"+$scope.couponSelect2.MERCHANTCODE;
        }else{
            $scope.activityInfo.MODULECOUPON1 =null;
        }
        if($scope.couponSelect3!=null){
            $scope.activityInfo.MODULECOUPON2 = $scope.couponSelect3.TEMPLATECODE+"&"+$scope.couponSelect3.MERCHANTCODE;
        }else{
            $scope.activityInfo.MODULECOUPON2 =null;
        }
        if($scope.couponSelect4!=null){
            $scope.activityInfo.MODULECOUPON3 = $scope.couponSelect4.TEMPLATECODE+"&"+$scope.couponSelect4.MERCHANTCODE;
        }else{
            $scope.activityInfo.MODULECOUPON3 =null;
        }
        if($scope.couponSelect5!=null){
            $scope.activityInfo.MODULECOUPON4 = $scope.couponSelect5.TEMPLATECODE+"&"+$scope.couponSelect5.MERCHANTCODE;
        }else{
            $scope.activityInfo.MODULECOUPON4 =null;
        }
        if($scope.couponSelect6!=null){
            $scope.activityInfo.MODULECOUPON5 = $scope.couponSelect6.TEMPLATECODE+"&"+$scope.couponSelect6.MERCHANTCODE;
        }else{
            $scope.activityInfo.MODULECOUPON5 =null;
        }
        if($scope.couponSelect7!=null){
            $scope.activityInfo.MODULECOUPON6 = $scope.couponSelect7.TEMPLATECODE+"&"+$scope.couponSelect7.MERCHANTCODE;
        }else{
            $scope.activityInfo.MODULECOUPON6 =null;
        }

        $scope.activityInfo.PROBABILITY0 = $scope.probability1;
        $scope.activityInfo.PROBABILITY1 = $scope.probability2;
        $scope.activityInfo.PROBABILITY2 = $scope.probability3;
        $scope.activityInfo.PROBABILITY3 = $scope.probability4;
        $scope.activityInfo.PROBABILITY4 = $scope.probability5;
        $scope.activityInfo.PROBABILITY5 = $scope.probability6;
        $scope.activityInfo.PROBABILITY6 = $scope.probability7;
        $scope.activityInfo.VISITNUM=0;
        //console.log($scope.activityInfo);
        $http({
            url:'../activity/addOneActivity',
            method:"POST",
            headers: {
                'Content-Type': "application/json;charset=UTF-8"
            },
            data:{activityInfo:$scope.activityInfo}
        })
        .success(function(data){
                console.log(data);
            if(data.status){
                alert("创建活动成功");
                window.location.href= "./gamebegin"+1;
            }else{
                alert("创建活动失败");
            }
        })
        .error(function(data){
            alert("创建活动失败");
        })
    }

}]);