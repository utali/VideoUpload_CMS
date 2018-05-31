'use strict'

angular
  .module('theme.pages-controllers', [])
  .controller('SignupPageController', ['$scope', '$global','$http', function ($scope, $global, $http, principal) {
      $scope.currentUser = {
        dat:{},
        old_password: '',
        new_password: '',
        re_new_password: ''
      };

    $global.set('fullscreen', true);

    $scope.$on('$destroy', function () {
      $global.set('fullscreen', false);
    });

      $scope.signIn = function() {
      //  $http.post(
      //      '/auth/api/login',
      //      {loginName: $scope.username, loginPassword: $scope.password}
      //  )
      //      .success(function(data) {
      //        console.log(data);
      //        //if (0 === data.errCode) {
      //        //  if(data.message.isFormal == '0'){
      //        //    $scope.currentUser.dat = data.message;
      //        //    _showDialogPasswordModify(function() {
      //        //      return false;
      //        //    });
      //        //  }else{
      //        //    principal.login(data.message);
      //        //    $state.go('main');
      //        //  }
      //        //}else{
      //        //  $scope.hasError = '';
      //        //  $state.go('login');
      //        //}
      //      })
      //      .error(function(data){
      //          console.log(data);
      //      })
      };

  }])
  .controller('RegistrationPageController', ['$scope', '$timeout', function ($scope, $timeout) {
  	$scope.checking = false;
  	$scope.checked = false;
  	$scope.checkAvailability = function () {
  		if ($scope.reg_form.username.$dirty==false) return;
  		$scope.checking = true;
  		$timeout( function () {
  			$scope.checking = false;
	  		$scope.checked = true;
  		}, 500);
  	};
  }])
  .controller('ChatRoomController', ['$scope', '$timeout', function ($scope, $t) {
    var eliza = new ElizaBot();
    var avatars = ['potter.png', 'tennant.png', 'johansson.png', 'jackson.png', 'jobs.png'];
    $scope.messages = [];
    $scope.userText = '';
    $scope.elizaTyping = false;
    $scope.elizaAvatar = 'johansson.png';

    $scope.sendMessage = function (msg) {
      var im = {
        class: 'me',
        avatar: 'jackson.png',
        text: msg
      };
      this.messages.push(im);
      this.userText = '';

      $t( function () {
        $scope.elizaAvatar = _.shuffle(avatars).shift();
        $scope.elizaTyping = true;
      }, 500);

      $t( function () {
        var reply = eliza.transform(msg)
        var im = {
          class: 'chat-success',
          avatar: $scope.elizaAvatar,
          text: reply
        };
        $scope.elizaTyping = false;
        $scope.messages.push(im);
      }, 1200)
    };
  }])
  .directive('scrollToBottom', function () {
    return {
      restrict: 'A',
      scope: {
        model: '=scrollToBottom'
      },
      link: function (scope, element, attr) {
        scope.$watch('model', function (n, o) {
          if (n != o) {
            element[0].scrollTop = element[0].scrollHeight;
          }
        });
      }
    };
  })