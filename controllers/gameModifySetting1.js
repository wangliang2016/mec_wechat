var mymodule=angular.module('ews',[]);
mymodule.controller('activitySettingcontrl',['$scope','$rootScope','$http',function ($scope,$rootScope,$http) {
    var activityId=$("#activityId")[0].content;
    var editor;
    $scope.couponTemplateInfos=[];
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
                if(data.msg!=null){
                    for(var i=0;i<$scope.couponTemplateInfos.length;i++){
                        $scope.couponTemplateInfos[i].showInfo=$scope.couponTemplateInfos[i].TEMPLATECODE.toString()+" "+$scope.couponTemplateInfos[i].TEMPLATECONTENT.toString();
                        console.log($scope.couponTemplateInfos[i].showInfo);
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
    $http({
        url:'../activity/queryTotalActivityInfo',
        method:"POST",
        headers: {
            'Content-Type': "application/json;charset=UTF-8"
        },
        data:{activityId:activityId}
    })
        .success(function(data){
            if(data.status){
                var originActivityInfo=data.msg.activity;
                var originGameInfo=data.msg.game;
                console.log(originActivityInfo.PICHOSTURL);
                $scope.ruleName=originActivityInfo.NAME;
                $scope.keyWords=originActivityInfo.KEYWORDS ;
                $scope.startTitle=originActivityInfo.STARTTITLE ;
                $('#upload-image-url-start_picurl').val(originActivityInfo.STARTPIC.substring(originActivityInfo.PICHOSTURL.length));
                $scope.activityIntroduction=originActivityInfo.STARTINTRO ;

                $scope.activityContent=originActivityInfo.INTRODUCTION ;
                KindEditor.ready(function(K) {
                    editor = K.create('textarea[name="activity_content"]', {
                        allowFileManager: true,
                        allowImageUpload:true,
                        uploadJson:'/games/uploadImg',
                        afterUpload: function(){this.sync();}, //图片上传后，将上传内容同步到textarea中
                        afterBlur: function(){this.sync();}   ////失去焦点时，将上传内容同步到textarea中
                    });
                    editor.html($scope.activityContent);
                });
                $('#activity_editor_content').html(originActivityInfo.INTRODUCTION);
                //$scope.activityContent="亲，欢迎参加刮刮卡抽奖活动，祝您好运哦！！ 亲，需要绑定账号才可以参加哦";
                console.log(originActivityInfo.INTRODUCTION);
                $scope.repeatWords=originActivityInfo.REPEATRESPONSE;
                $scope.ticketInformation=originActivityInfo.AUCTIONINFO;
                $('#upload-image-url-lottery_background').val(originActivityInfo.LOTTERYBACKGROUND.substring(originActivityInfo.PICHOSTURL.length));
                $('#upload-image-url-adimg').val(originActivityInfo.LOTTERYWORD.substring(originActivityInfo.PICHOSTURL.length));
                $scope.verificationWords=originActivityInfo.VERIFICATIONCODE;
                $scope.endTitle=originActivityInfo.ENDTITLE;
                $('#upload-image-url-end_picurl').val(originActivityInfo.ENDPIC.substring(originActivityInfo.PICHOSTURL.length));
                $scope.endIntroduction=originActivityInfo.ENDINTRO;
                $scope.focusLink=originActivityInfo.FOCUSLINK;
                $scope.shareTitle=originActivityInfo.SHARETITLE;
                $('#upload-image-url-share_img').val(originActivityInfo.SHAREPIC.substring(originActivityInfo.PICHOSTURL.length));
                $scope.shareIntroduction=originActivityInfo.SHAREINTRO;
                $scope.adLink=originActivityInfo.ADLINK;
                //$scope.activityInfo.SHARELINK = $scope.shareLink;
                $('#upload-image-url-merchant_logo').val(originActivityInfo.ADPIC.substring(originActivityInfo.PICHOSTURL.length));
                $scope.startTime=FormatDate(originActivityInfo.BEGINAT);
                $scope.endTime=FormatDate(originActivityInfo.BEGINAT);
                $("#beginTime").val(FormatDate(originActivityInfo.BEGINAT));
                $("#endTime").val(FormatDate(originActivityInfo.ENDAT));
                $scope.dateRange=FormatDate(originActivityInfo.BEGINAT)+" - "+FormatDate(originActivityInfo.ENDAT);
                $scope.prizeUpper=originActivityInfo.UPPERPRIZENUM;
                $scope.playNumUpper=originActivityInfo.UPPERPLAYNUM;
                $scope.funPrize=originActivityInfo.FUNPLAYNUM;
                $scope.shareNum=originActivityInfo.SHARENUM;
                $scope.activationTime=originActivityInfo.ACTIVATIONTIME;
                //下面是游戏部分的设置（当前系统不考虑实物）
                $scope.awardType1=originGameInfo.MODULETITLE0;
                $scope.awardType2=originGameInfo.MODULETITLE1;
                $scope.awardType3=originGameInfo.MODULETITLE2;
                $scope.awardType4=originGameInfo.MODULETITLE3;
                $scope.awardType5=originGameInfo.MODULETITLE4;
                $scope.awardType6=originGameInfo.MODULETITLE5;
                $scope.awardType7=originGameInfo.MODULETITLE6;

                if(originGameInfo.MODULECOUPON0!=null){
                    console.log("here");
                    $("#couponSelect1").find("option[text='09080724 EP满300减20元优惠券']").attr("selected",true);
                    //$scope.couponSelect1='09080724 EP满300减20元优惠券';
                    $scope.probability1=originGameInfo.PROBABILITY0;
                    $scope.awardName1=originGameInfo.MODULECONTENT0;
                }
                if(originGameInfo.MODULECOUPON1!=null){
                    $scope.couponSelect2=originGameInfo.MODULECOUPON1;
                    $scope.probability2=originGameInfo.PROBABILITY1;
                    $scope.awardName2=originGameInfo.MODULECONTENT1;
                }
                if(originGameInfo.MODULECOUPON2!=null){
                    $scope.couponSelect3=originGameInfo.MODULECOUPON2;
                    $scope.probability3=originGameInfo.PROBABILITY2;
                    $scope.awardName3=originGameInfo.MODULECONTENT2;
                }
                if(originGameInfo.MODULECOUPON3!=null){
                    $scope.couponSelect4=originGameInfo.MODULECOUPON3;
                    $scope.probability4=originGameInfo.PROBABILITY3;
                    $scope.awardName4=originGameInfo.MODULECONTENT3;
                }
                if(originGameInfo.MODULECOUPON4!=null){
                    $scope.couponSelect5=originGameInfo.MODULECOUPON4;
                    $scope.probability5=originGameInfo.PROBABILITY4;
                    $scope.awardName5=originGameInfo.MODULECONTENT4;
                }
                if(originGameInfo.MODULECOUPON5!=null){
                    $scope.couponSelect6=originGameInfo.MODULECOUPON5;
                    $scope.probability6=originGameInfo.PROBABILITY5;
                    $scope.awardName6=originGameInfo.MODULECONTENT5;
                }
                if(originGameInfo.MODULECOUPON6!=null){
                    $scope.couponSelect7=originGameInfo.MODULECOUPON6;
                    $scope.probability7=originGameInfo.PROBABILITY6;
                    $scope.awardName7=originGameInfo.MODULECONTENT6;
                }

            }else{
                alert("信息已过期，请刷新页面");
            }
        })
        .error(function(data){
            alert("创建活动失败");
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
        $scope.activityInfo.ACTIVITYID = activityId;
        $scope.activityInfo.NAME = $scope.ruleName;
        $scope.activityInfo.KEYWORDS = $scope.keyWords;
        $scope.activityInfo.STARTTITLE = $scope.startTitle;
        $scope.activityInfo.STARTPIC = $('#upload-image-url-start_picurl').val();
        $scope.activityInfo.STARTINTRO = $scope.activityIntroduction;
        $scope.activityInfo.INTRODUCTION =editor.html();
        console.log($scope.activityInfo.INTRODUCTION);
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
        //$scope.activityInfo.USERCODE = 0;
        $scope.activityInfo.VISITNUM = 0;
        if($scope.activationTime==null||isNaN($scope.activationTime)){
                $scope.activationTime=null;
        }
        $scope.activityInfo.ACTIVATIONTIME=$scope.activationTime;

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
        if($scope.couponSelect4!=null) {
            $scope.activityInfo.MODULEGOODSNUM3 = $scope.couponSelect4.TOTALNUMBER;
        }else{
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
            url:'../activity/updateOneActivity',
            method:"POST",
            headers: {
                'Content-Type': "application/json;charset=UTF-8"
            },
            data:{activityInfo:$scope.activityInfo}
        })
            .success(function(data){
                if(data){
                    alert("创建活动成功");
                }
            })
            .error(function(data){
                alert("创建活动失败");
            })
    }

}]);