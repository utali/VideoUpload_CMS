'use strict';

angular
    .module('themesApp', [
        'easypiechart',
        'toggle-switch',
        'ui.bootstrap',
        'ui.tree',
        'ui.select2',
        'ngGrid',
        'xeditable',
        'flow',
        'theme.services',
        'theme.directives',
        'theme.factories',
        'theme.navigation-controller',
        'theme.notifications-controller',
        'theme.messages-controller',
        'theme.colorpicker-controller',
        'theme.layout-horizontal',
        'theme.layout-boxed',
        'theme.vector_maps',
        'theme.google_maps',
        'theme.calendars',
        'theme.gallery',
        'theme.tasks',
        'theme.ui-tables-basic',
        'theme.ui-panels',
        'theme.ui-ratings',
        'theme.ui-modals',
        'theme.ui-tiles',
        'theme.ui-alerts',
        'theme.ui-sliders',
        'theme.ui-progressbars',
        'theme.ui-paginations',
        'theme.ui-carousel',
        'theme.ui-tabs',
        'theme.ui-nestable',
        'theme.form-components',
        'theme.form-directives',
        'theme.form-validation',
        'theme.form-inline',
        'theme.form-image-crop',
        'theme.form-uploads',
        'theme.tables-ng-grid',
        'theme.tables-editable',
        'theme.charts-flot',
        'theme.charts-canvas',
        'theme.charts-svg',
        'theme.charts-inline',
        'theme.pages-controllers',
        'theme.dashboard',
        'theme.templates',
        'theme.template-overrides',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngAnimate',
        'oc.lazyLoad'
    ])
    .controller('MainController', ['$scope', '$global', '$timeout', 'progressLoader', '$location', '$routeParams','$rootScope','picture','dialogs', function ($scope, $global, $timeout, progressLoader, $location, $routeParams, $rootScope, picture,dialogs) {

        //获取相册
        function gainPictures() {
            $timeout(function () {
                picture.getPictures('img').then(function (data) {
                    if (data.errCode === '0') {
                        $rootScope.pictures = data.message;
                    } else {
                        dialogs.openAlert('数据管理',data.message, '确定', '')
                    }
                });
            })
        }
        //获取视频
        function gainVideos() {
            $timeout(function () {
                picture.getPictures('video').then(function (data) {
                    if (data.errCode === '0') {
                        $rootScope.videos = data.message;
                    } else {
                        dialogs.openAlert('数据管理',data.message, '确定', '')
                    }
                });
            })
        }
        gainVideos();
        gainPictures();

        $global.set('leftbarCollapsed', true);
        $global.set('leftbarShown', false);
        $scope.style_fixedHeader = $global.get('fixedHeader');
        $scope.style_headerBarHidden = $global.get('headerBarHidden');
        $scope.style_layoutBoxed = $global.get('layoutBoxed');
        $scope.style_fullscreen = $global.get('fullscreen');
        $scope.style_leftbarCollapsed = $global.get('leftbarCollapsed');
        $scope.style_leftbarShown = $global.get('leftbarShown');
        $scope.style_rightbarCollapsed = $global.get('rightbarCollapsed');
        $scope.style_isSmallScreen = false;
        $scope.style_showSearchCollapsed = $global.get('showSearchCollapsed');
        $scope.style_layoutHorizontal = $global.get('layoutHorizontal');

        $scope.hideSearchBar = function () {
            $global.set('showSearchCollapsed', false);
        };

        $scope.hideHeaderBar = function () {
            $global.set('headerBarHidden', true);
        };

        $scope.showHeaderBar = function ($event) {
            $event.stopPropagation();
            $global.set('headerBarHidden', false);
        };
        $scope.toggleLeftBar = function () {
            if ($scope.style_isSmallScreen) {
                return $global.set('leftbarShown', !$scope.style_leftbarShown);
            }
            $global.set('leftbarCollapsed', !$scope.style_leftbarCollapsed);
        };

        $scope.toggleRightBar = function () {
            $global.set('rightbarCollapsed', !$scope.style_rightbarCollapsed);
        };

        $scope.$on('globalStyles:changed', function (event, newVal) {
            $scope['style_' + newVal.key] = newVal.value;
        });
        $scope.$on('globalStyles:maxWidth767', function (event, newVal) {
            $timeout(function () {
                $scope.style_isSmallScreen = newVal;
                if (!newVal) {
                    $global.set('leftbarShown', false);
                } else {
                    $global.set('leftbarCollapsed', false);
                }
            });
        });

        // there are better ways to do this, e.g. using a dedicated service
        // but for the purposes of this demo this will do :P
        $scope.isLoggedIn = false;
        $scope.logOut = function () {
            $scope.isLoggedIn = false;
        };
        $scope.logIn = function () {
            $scope.isLoggedIn = true;
        };

        $scope.rightbarAccordionsShowOne = false;
        $scope.rightbarAccordions = [{open: true}, {open: true}, {open: true}, {open: true}, {open: true}, {open: true}, {open: true}];

        $scope.$on('$routeChangeStart', function (e) {
            progressLoader.start();
            progressLoader.set(50);
        });
        $scope.$on('$routeChangeSuccess', function (e) {
            progressLoader.end();
        });

        //if (principal.isIdentityResolved()) {
        //  principal.authenticate().then(function(data) {
        //    if (principal.isAuthenticated()) {
        //      $rootScope.username = data.nickName;
        //      $rootScope.uid = data.uid;
        //      $rootScope.sign = data.sign;
        //      $rootScope.sysInfo.title = data.attTitle;
        //      $rootScope.sysInfo.bgColor = data.attBackground_color;
        //      $rootScope.domain = data.domain;
        //      $rootScope.kind = data.kind;
        //    } else {
        //      $state.go('login');
        //    }
        //  });
        //} else {
        //  $state.go('login');
        //}
    }])
    .config(['$provide', '$routeProvider', function ($provide, $routeProvider, $ocLazyLoad) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/index.html',
            })
            .when('/form-ckeditor', {
                templateUrl: 'views/form-ckeditor.html',
                resolve: {
                    lazyLoad: ['lazyLoad', function (lazyLoad) {
                        return lazyLoad.load([
                            'assets/plugins/form-ckeditor/ckeditor.js',
                            'assets/plugins/form-ckeditor/lang/en.js'
                        ]);
                    }]
                }
            })
            .when('/form-imagecrop', {
                templateUrl: 'views/form-imagecrop.html',
                resolve: {
                    lazyLoad: ['lazyLoad', function (lazyLoad) {
                        return lazyLoad.load([
                            'assets/plugins/jcrop/js/jquery.Jcrop.js'
                        ]);
                    }]
                }
            })
            .when('/form-wizard', {
                templateUrl: 'views/form-wizard.html',
                resolve: {
                    lazyLoad: ['lazyLoad', function (lazyLoad) {
                        return lazyLoad.load([
                            'bower_components/jquery-validation/dist/jquery.validate.js',
                            'bower_components/stepy/lib/jquery.stepy.js'
                        ]);
                    }]
                }
            })
            .when('/form-masks', {
                templateUrl: 'views/form-masks.html',
                resolve: {
                    lazyLoad: ['lazyLoad', function (lazyLoad) {
                        return lazyLoad.load([
                            'bower_components/jquery.inputmask/dist/jquery.inputmask.bundle.js'
                        ]);
                    }]
                }
            })
            .when('/:templateFile', {
                templateUrl: function (param) {
                    return 'views/' + param.templateFile + '.html'
                }
            })
            .when('/:modules/:moduleName', {
                templateUrl: function ($routeParams) {
                    return 'modules/' + $routeParams.modules + '/' + $routeParams.moduleName + '/' + 'index.html'
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$route', function ($ocLazyLoad, $route) {
                        return $ocLazyLoad.load([{
                            files: ['modules/' + $route.current.params.modules + '/' + $route.current.params.moduleName + '/ctrl.js']
                        }]);
                    }]
                },
                controller: function ($routeParams) {
                    return 'ctrl-' + $routeParams.modules + '-' + $routeParams.moduleName
                }
            })
            .otherwise({
                redirectTo: '/extras-404'
            });
    }]);
