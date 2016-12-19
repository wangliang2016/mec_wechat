var mymodule=angular.module('ews',[]);

mymodule.controller('allGamesContrl',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
    $http({
        url:'game/getAllGame',
        method:"POST",
        headers: {
            'Content-Type': "application/json;charset=UTF-8"
        }
    }).success(function(data){

    }).error(function(status){

    });
}])