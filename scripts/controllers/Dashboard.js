'use strict'

angular.module('theme.dashboard',  [])
  .controller('DashboardController', ['$scope','$location','$rootScope', function ($scope,$location,$rootScope) {
      $scope.showPictures = function (images) {
        $location.path('/more/pictures');
        if (images) {
            $rootScope.isInfo = true;
            $rootScope.images = images.img;
            $rootScope.mainTitle = images.text;
            $rootScope.imageName = images.text;
        } else {
            $rootScope.isInfo = false;
            $rootScope.images = '';
            $rootScope.mainTitle = '相册';
        }
      };
      $scope.showVideos = function () {
          $location.path('/more/videos')
      }
  }]);