var mymodule=angular.module('ews',[]);
mymodule.controller('gamebegincontrl',['$scope','$rootScope','$http',function ($scope,$rootScope,$http) {
    var gameCode=$("#gameCode")[0].content;
    function FormatDate (strTime) {
        var date = new Date(strTime);
        return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    }
    $rootScope.activityCount=10;
    $http({
        url:'../activity/queryRelativeActivity',
        method:"POST",
        headers: {
            'Content-Type': "application/json;charset=UTF-8"
        },
        data:{queryword:null,gamecode:gameCode}
    })
    .success(function(data){
        if(data){
            if(data.status==true){
                $rootScope.activityTotalInfos=data.msg;
                $rootScope.totalNum=$scope.activityTotalInfos.length;
                for(var i=0;i<$scope.totalNum;i++){
                    $scope.activityTotalInfos[i].BEGINAT=FormatDate($scope.activityTotalInfos[i].BEGINAT);
                    $scope.activityTotalInfos[i].ENDAT=FormatDate($scope.activityTotalInfos[i].ENDAT);
                }
                if($rootScope.totalNum%$rootScope.activityCount==0){
                    $rootScope.finalNum=$rootScope.totalNum/$rootScope.activityCount;
                }else{
                    $rootScope.finalNum=$rootScope.totalNum/$rootScope.activityCount+1;
                }

                if($rootScope.totalNum<$rootScope.activityCount){
                    $scope.activityInfos=$rootScope.activityTotalInfos;
                }else{
                    $scope.activityInfos=$rootScope.activityTotalInfos.slice(0,$rootScope.activityCount);
                }
            }else{
                $scope.activityInfos=[];
            }
        }

    })
    .error(function(data){
        $scope.activityInfos=null;
    });
    $scope.addActivityPage=function(settingnum){
        window.location.href="../games/gameSetting"+settingnum;
    }
    $scope.currentActivityPre=function() {
        $rootScope.currentActivity = $rootScope.currentActivity - 1;
        var startNum = $rootScope.currentActivity * $rootScope.activityCount;
        $scope.activityInfos=$rootScope.activityTotalInfos.slice(startNum,startNum+$rootScope.activityCount);
    }

    $scope.currentActivityNext=function() {
        $rootScope.currentActivity =$rootScope.currentActivity + 1;
        var startNum = $rootScope.currentActivity * $rootScope.activityCount;
        if($rootScope.totalNum-startNum<=$rootScope.activityCount){
            $scope.activityInfos=$rootScope.activityTotalInfos.slice(startNum,$rootScope.totalNum);
        }else{
            $scope.activityInfos=$rootScope.activityTotalInfos.slice(startNum,startNum+$rootScope.activityCount);
        }
    }


    $scope.queryActivityInfo=function(gameCode){
        $http({
            url:'../activity/queryRelativeActivity',
            method:"POST",
            headers: {
                'Content-Type': "application/json;charset=UTF-8"
            },
            data:{queryword:$scope.queryActivityName,gamecode:gameCode}
        })
            .success(function(data){
                if(data){
                    console.log(data);
                    if(data.status==true){
                        $rootScope.currentActivity=0;
                        $rootScope.activityTotalInfos=data.msg;
                        $rootScope.totalNum=$scope.activityTotalInfos.length;
                        for(var i=0;i<$scope.totalNum;i++){
                            $scope.activityTotalInfos[i].BEGINAT=FormatDate($scope.activityTotalInfos[i].BEGINAT);
                            $scope.activityTotalInfos[i].ENDAT=FormatDate($scope.activityTotalInfos[i].ENDAT);
                        }
                        if($rootScope.totalNum%$rootScope.activityCount==0){
                            $rootScope.finalNum=$rootScope.totalNum/$rootScope.activityCount;
                        }else{
                            $rootScope.finalNum=$rootScope.totalNum/$rootScope.activityCount+1;
                        }

                        if($rootScope.totalNum<$rootScope.activityCount){
                            $scope.activityInfos=$rootScope.activityTotalInfos;
                        }else{
                            $scope.activityInfos=$rootScope.activityTotalInfos.slice(0,$rootScope.activityCount);
                        }
                    }else{
                        $scope.activityInfos=[];
                    }
                }

            })
            .error(function(data){
                $scope.activityInfos=null;
            });
    }
}]);
mymodule.controller('gamebegincontrl1',['$scope','$rootScope','$http',function ($scope,$rootScope,$http) {
    var gameCode=1;
    $rootScope.currentActivity=0;
    $scope.queryActivityInfo=function(settingnum){
        $http({
            url:'../activity/queryRelativeActivity',
            method:"POST",
            headers: {
                'Content-Type': "application/json;charset=UTF-8"
            },
            data:{queryword:$scope.queryActivityName,gamecode:settingnum}
        })
        .success(function(data){
            if(data){
                if(data.status==true){
                    console.log(data);
                    $scope.activityInfos=data;
                }else{
                    $scope.activityInfos=[];
                }
            }

        })
        .error(function(data){
            $scope.activityInfos=null;
        })
    };
    $scope.addActivityPage=function(settingnum){
        window.location.href="./games/gameSetting"+settingnum;
    }
    $scope.editOneActivity=function(settingnum,activityId){
        window.location.href="../games/gameModifySetting"+settingnum+"?activityId="+activityId;
    }
    $scope.deleteOneActivity=function(index,activityId){
        console.log(index);
        $http({
            url:'../activity/deleteOneActivity',
            method:"POST",
            headers: {
                'Content-Type': "application/json;charset=UTF-8"
            },
            data:{activityId:activityId}
        })
            .success(function(data){
                if(data){
                    if(data.status==true){
                        console.log($scope.activityInfos);
                        $scope.activityInfos.splice(index,1);
                    }else{
                        alert("删除失败");
                    }
                }

            })
            .error(function(data){
                $scope.activityInfos=null;
            })
    }
}]);