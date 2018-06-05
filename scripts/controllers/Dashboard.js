'use strict'

angular.module('theme.dashboard',  [])
  .controller('DashboardController', ['$scope','$location','$rootScope', function ($scope,$location,$rootScope) {
      $scope.showPictures = function (images) {
        $location.path('/more/pictures');
        if (images) {
            $rootScope.isInfo = true;
            $rootScope.images = images.src;
            $rootScope.mainTitle = images.text;
            $rootScope.imageName = images.text;
        } else {
            $rootScope.isInfo = false;
            $rootScope.images = '';
            $rootScope.mainTitle = '相册';
        }
      };
      $scope.showVideos = function (video) {
          $location.path('/more/videos');
          if (video) {
              $rootScope.isInfo = true;
              $rootScope.videoText = video.text;
              $rootScope.videoSrc = video.src;
          } else {
              $rootScope.isInfo = false;
          }
      };
  }]);