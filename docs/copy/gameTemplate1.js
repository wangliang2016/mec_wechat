$(document).ready(function() {
    var activityId = $("#activityId")[0].content;
    var openId = $('#OpenId')[0].content;
    var playStatus = false;
    var whetherRegister = false;
    var activityInfo = {};
    var gameInfo = {};
    var activityInfo={};
    var gameInfo={};
    $.ajax({
        url: '../activity/queryTotalActivityInfo',
        type: 'post',
        data: {activityId:activityId},
        async: false,
        dataType: 'html',
        timeout: 10000,
        success: function (data) {
            if (data.status == true) {
                activityInfo = data.msg.activity;
                gameInfo = data.msg.game;
                $('#adHref').val(activityInfo.ADLINK);
                //console.log($scope.activityInfo);
                $scope.backgroundUrl = $scope.activityInfo.LOTTERYBACKGROUND.toString();
                $scope.wordUrl = $scope.activityInfo.LOTTERYWORD.toString();
                $scope.adPic = $scope.activityInfo.ADPIC;
                $scope.sharePic = $scope.activityInfo.SHAREPIC;
                $scope.shareTitle = $scope.activityInfo.SHARETITLE;
                $scope.shareIntro = $scope.activityInfo.SHAREINTRO;
                $scope.gameAddress = $scope.activityInfo.GAMEADDRESS;
                $scope.prizes = [];
                for (var i = 0; i < 7; i++) {
                    var title = "MODULETITLE" + i;
                    var content = "MODULECONTENT" + i;
                    var num = "MODULEGOODSNUM" + i;
                    if ($scope.gameInfo[content] != null) {
                        var prize = {};
                        prize.title = $scope.gameInfo[title];
                        prize.content = $scope.gameInfo[content];
                        prize.num = $scope.gameInfo[num];
                        $scope.prizes.push(prize);
                    }
                }
            } else {
                alert(data.msg);
            }
        },
        error: function (data) {
            alert(data);
        }
    })
    //获取当前游戏状态
    $.ajax({
        url: '../subscriber/queryActivityPlayStatusByOpenId',
        type: 'post',
        async: false,
        dataType: 'html',
        timeout: 10000,
        data: {openId: openId, activityId: activityId}
        success: function (data) {
            if ((data.subscriberStatus == true) && (data.activityStatus == true)) {
                //该用户已经注册并且已经玩过该游戏
                $scope.subscriberInfo = data.subscribeMsg;
                $scope.activityPlayInfo = data.activtyMsg;
                $scope.havePlayedNum = $scope.activityPlayInfo.HAVEPLAYEDNUM;
                $scope.playtimes = $scope.activityPlayInfo.PLAYTIMES;
                $scope.totalNum = $scope.playtimes;
                $scope.useNum = $scope.havePlayedNum;
                $scope.whetherRegister = true;
                $scope.tele = $scope.subscriberInfo.TELEPHONE;
                $scope.userid = $scope.subscriberInfo.USERID;
                if ($scope.useNum < $scope.totalNum) {
                    $scope.playStatus = true;
                }
            } else {
                if ((data.subscriberStatus == true) && (data.activityStatus == false) && (data.activtyMsg == null)) {
                    //该用户已经注册但没有玩过该游戏
                    $scope.subscriberInfo = data.subscribeMsg;
                    $scope.totalNum = $scope.activityInfo.FUNPLAYNUM;
                    $scope.useNum = 0;
                    $scope.whetherRegister = true;
                    $scope.tele = $scope.subscriberInfo.TELEPHONE;
                    $scope.userid = $scope.subscriberInfo.USERID;
                    if ($scope.totalNum > 0) {
                        $scope.playStatus = true;
                    }
                } else {
                    if ((data.subscriberStatus == false) && (data.activityStatus == false) && (data.subscribeMsg == null)) {
                        //该用户没有注册
                        $scope.totalNum = $scope.activityInfo.FUNPLAYNUM;
                        $scope.useNum = 0;
                        if ($scope.totalNum > 0) {
                            $scope.playStatus = true;
                        }
                    } else {
                        alert(data.msg);
                    }
                }
            }

        },
        error: function (data) {
            alert(data);
        }
    });
//scrtch点击事件后判断能否参与
    $scope.scratchClick = function () {
        if ($scope.playStatus == false) {
            $("#ggk1c").html("Sorry，您无法进行抽奖");
        } else {
            $(function () {
                window.sncode = "";
                window.prize = "";
                var goon = true;
                var iszj = 0;
                var flag = true;
                $("#ggk1c").html(prize);//提示
                $('#ggk1').wScratchPad({
                    size: 15, // 笔刷的大小/划痕
                    bg: '', // 背景(图片路径或十六进制颜色)
                    fg: '#c9c7c7', // 前景(图片路径或十六进制颜色)
                    cursor: '', // 设置光标(图片路径或样式属性)
                    scratchMove: function (e, p) {
                        if (flag) {
                            flag = false;
                            link = '';
                            if ($scope.whetherRegister == true) {
                                var data = {};
                                data.activityInfo = $scope.activityInfo;
                                data.gameInfo = $scope.gameInfo;
                                data.userCode = $scope.tele;
                                data.userId = $scope.userid;
                                data.openId = $scope.openId;
                                $.ajax({
                                    url: '/gameresult/resultWithRegister', dataType: 'json', type: 'get',
                                    success: function (data) {
                                        //data.success表示是否获得奖品
                                        goon = false;
                                        //count ++;
                                        //credit -= bonus;
                                        //$("#credit").text(credit);
                                        /*if($("#count").length>0){
                                         $("#count").text(parseInt($("#count").text())+1);
                                         }*/
                                        //将已刮次数加一
                                        if ($("#totalcount").length > 0) {
                                            $("#totalcount").text(parseInt($("#totalcount").text()) + 1)
                                        }
                                        if (data.success) {
                                            $("#ggk1c").html(data.name);//提示
                                            $("#sncode").text(data.sn);
                                            window.sncode = data.sn;
                                            window.prize = data.name;
                                            link = data.link;
                                            $("#jp_type").html(data.name)
                                            $("#jp_name").html(data.award);
                                            $("#jp_code").html('兑奖码：' + data.sn);
                                            $("#jp_merchantcode").html(data.merchantcode);
                                            if (data.prize_username) {
                                                $("#realname").removeClass('none');
                                                $("#realname").attr("data-value", data.prize_username);
                                            }
                                            if (data.prize_address) {
                                                $("#address").removeClass('none');
                                                $("#address").attr("data-value", data.prize_address);
                                            }
                                            $scope.personInfoShow = false;
                                        } else {
                                            window.prize = '谢谢参与';
                                            $("#ggk1c").html(data.name);//提示
                                            //$('#more').show();
                                            //setTimeout('time_flood()', 1000);
                                        }
                                    }
                                });
                            } else {
                                var data = {};
                                data.activityInfo = $scope.activityInfo;
                                data.gameInfo = $scope.gameInfo;
                                data.openId = $scope.openId;
                                //默认不能是1等奖
                                $.ajax({
                                    url: '/gameresult/resultWithoutRegister', dataType: 'json', type: 'get',
                                    success: function (data) {
                                        //data.success表示是否获得奖品
                                        goon = false;
                                        //count ++;
                                        //credit -= bonus;
                                        //$("#credit").text(credit);
                                        /*if($("#count").length>0){
                                         $("#count").text(parseInt($("#count").text())+1);
                                         }*/
                                        //将已刮次数加一
                                        if ($("#totalcount").length > 0) {
                                            $("#totalcount").text(parseInt($("#totalcount").text()) + 1)
                                        }
                                        if (data.success) {
                                            $("#ggk1c").html(data.name);//提示
                                            $("#sncode").text(data.sn);
                                            window.sncode = data.sn;
                                            window.prize = data.name;
                                            link = data.link;
                                            $("#jp_type").html(data.name)
                                            $("#jp_name").html(data.award);
                                            $("#jp_code").html('兑奖码：' + data.sn);
                                            $("#jp_merchantcode").html(data.merchantcode);
                                            if (data.prize_username) {
                                                $("#realname").removeClass('none');
                                                $("#realname").attr("data-value", data.prize_username);
                                            }
                                            if (data.prize_address) {
                                                $("#address").removeClass('none');
                                                $("#address").attr("data-value", data.prize_address);
                                            }
                                            $scope.personInfoShow = true;
                                        } else {
                                            window.prize = '谢谢参与';
                                            $("#ggk1c").html(data.name);//提示
                                            //$('#more').show();
                                            //setTimeout('time_flood()', 1000);
                                        }
                                    }
                                });
                            }
                        }
                        if (goon == false) {
                            if (p > 30) {
                                this.clear();
                                if (window.prize != '' && window.prize != '谢谢参与') {
                                    $("canvas").css("display", "none");
                                    $(".zhongjiang").css("display", "block");
                                } else {
                                    $("canvas").css("display", "none");
                                    $(".weizhongjiang").css("display", "block");
                                }
                                $('.Scratch_btn').show();
                            }
                        }
                    }
                });

                $('.close').click(function () {
                    $(this).parent().hide();
                });
                /*$('.share').click(function(){
                 $('.share').hide();
                 });*/
                $('.receive').click(function () {
                    $('.receive').hide();
                });
                $('.btn').click(function () {
                    $(this).parents('div.layer').hide();
                });
                $('.try').click(function () {
                    $('.Scratch_btn').show();
                });
                $('.form_btn').click(function () {
                    var nameval = $("#realname").attr("data-value");
                    var addressval = $("#address").attr("data-value");
                    var realname = $('#realname').val();
                    var phone = $('#phone').val();
                    var address = $('#address').val();
                    if (realname == '' && nameval == 1) {
                        alert('请输入姓名！');
                        $('#realname').focus();
                        return false;
                    }
                    if (!/^1[3578][0-9]{9}$/.test(phone)) {
                        alert('请输入正确的手机号！');
                        $('#phone').focus();
                        return false;
                    }
                    if (address == '' && addressval == 1) {
                        alert('请输入您的收货地址!');
                        $('#address').focus();
                        return false;
                    }
                    var submitData = {
                        code: $("#sncode").text(),
                        merchantcode: $("#jp_merchantcode").text(),
                        realname: realname,
                        mobile: phone,
                        openId: $scope.openId,
                        activityId: $scope.activityId
                    };

                    $.post('/gameresult/confirmWithPhone', submitData, function (data) {
                        if (data.success == true) {
                            $('.zhongjiang').hide();
                            $('.receive').show();
                            if (link) {
                                alert('提交成功');
                                location.href = link;
                            } else {
                                setTimeout(function () {
                                    location.reload();
                                }, 2000);
                            }
                        } else {
                            alert(data.msg);
                        }
                        $('#more').show();
                        setTimeout('time_flood()', 1000);
                    }, "json")
                });
            })
        }
    }
//微信分享内容
    //分享连接
    var lineLink = $scope.gameAddress;
    //图片连接
    var Url = $scope.sharePic;
    //分享内容
    var descContent = $scope.shareIntro;
    var shareTitle = $scope.shareTitle;

    wx.config({
        appId: 'wx5c30177c4f734b4c',
        timestamp: '1477994209',
        nonceStr: 'sde4b6VwdI6VqaPB',
        signature: '9ad92ecb509492cb9b1712a11549a587df85ebab',
        jsApiList: [
            // 所有要调用的 API 都要加到这个列表中
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'hideMenuItems'
        ]

    });
    wx.checkJsApi({
        jsApiList: [
            'onMenuShareTimeline',
            'onMenuShareAppMessage'

        ], // 需要检测的JS接口列表，所有JS接口列表见附录2,
        success: function (res) {
            // alert(res);
            //以键值对的形式返回，可用的api值true，不可用为false
            // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"
        }
    });

    wx.ready(function () {  // 在这里调用 API\
        wx.hideMenuItems({
            menuList: [
                'menuItem:share:qq', // 阅读模式
                'menuItem:share:facebook', // 分享到朋友圈
                'menuItem:openWithQQBrowser', // 分享到朋友圈
                'menuItem:openWithSafari', // 分享到朋友圈

                'menuItem:share:weiboApp' // 复制链接
            ] // 要隐藏的菜单项，所有menu项见附录3
        });
        //分享到朋友圈
        wx.onMenuShareTimeline({
            title: shareTitle, // 分享标题
            link: lineLink, // 分享链接
            imgUrl: Url, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        //分享到朋友
        wx.onMenuShareAppMessage({
            title: shareTitle, // 分享标题
            desc: descContent, // 分享描述
            link: lineLink, // 分享链接
            imgUrl: Url, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        wx.showOptionMenu();
    });
});
