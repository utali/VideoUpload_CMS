/**
 * Created by liqiaoqiao on 2018/5/30.
 */
'use strict';

var app = angular.module('themesApp');
app.controller('ctrl-more-pictures', ['$scope','$rootScope','$timeout', 'dialogs','$modal','picture',function ($scope,$rootScope,$timeout, dialogs,$modal, picture) {
    $scope.mainTitle = $rootScope.mainTitle || '相册';
    $scope.isInfo = $rootScope.isInfo;
    $scope.infoFile = 'views/images.html';
    $scope.images = $rootScope.images;
    $scope.imageName = $rootScope.imageName;
    $scope.showImages = function (images) {
        $scope.isInfo = true;
        $scope.images = images.src;
        $scope.mainTitle = images.text;
        $scope.imageName = images.text;
    };
    $scope.showImg = function (src) {
        $modal.open({
            templateUrl: 'imageModalContent.html',
            controller:  ['$scope', '$modalInstance','images', function ($scope, $modalInstance,images) {
                $scope.src = src;
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.preShow = function () {
                    var index = images.findIndex(function (item) {
                        return item === $scope.src.slice(19,)
                    });
                    index > 0 ? $scope.src = images[index-1] : '';
                };
                $scope.nextShow = function () {
                    var index = images.findIndex(function (item) {
                        return item === $scope.src.slice(19,)
                    });
                    index < images.length-1 ? $scope.src = images[index+1] : '';
                };
            }],
            size:        'lg',
            resolve: {
                images: function () {
                    return $scope.images;
                }
            }
        });
    };
    $scope.cancel = function () {
        $scope.isInfo = false;
        $scope.mainTitle = '相册';
    };
    //上传图片
    $scope.upload = function (name) {
        new BUpload({
            src:'imgFile',
            upload_url : "/upload/img/"+name,
            list_url : null,	//图片列表数据获取url
            search_url : null,	//图片搜索页面url
            grap_url : null, //搜索网络图片的抓取url
            max_filesize : 1024,
            max_filenum : 10,
            callback : function(data) {
                if (data.length>0){
                    gainPictures();
                    dialogs.openAlert('图片上传','图片上传成功！','确定',function () {
                        $timeout(function () {
                            var idx = $rootScope.pictures.findIndex(function (item) {
                                return item.text === name;
                            });
                            $scope.images = $rootScope.pictures[idx].src;
                        },100)
                    })
                }
            }
        });
    };
    //创建新相册
    $scope.createPictures = function () {
        $modal.open({
            templateUrl: 'newPictures.html',
            controller: function ($scope,$modalInstance,pictures,upload,picture, dialogs,$rootScope) {
                var picturesName = '';
                // $scope.isCreate = true;
                $scope.ok = function (status) {
                    picturesName = $('#picturesName').val();
                    // if (status === '1') {
                    //     $modalInstance.dismiss('cancel');
                    //     $timeout(function () {
                    //         upload(pictures[pictures.length-1].text);
                    //     },100);
                    //     return;
                    // }
                    if (picturesName === '') return;
                    createPictures(picturesName);
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
                // //获取相册
                // function gainPictures() {
                //     $timeout(function () {
                //         picture.getPictures('img').then(function (data) {
                //             if (data.errCode === '0') {
                //                 pictures = data.message;
                //             } else {
                //                 dialogs.openAlert('数据管理',data.message, '确定', '')
                //             }
                //         });
                //     })
                // }
                //新建相册
                function createPictures(picturesName) {
                    $timeout(function () {
                        picture.setPictures(picturesName, 'img').then(function (data) {
                            if (data.errCode === '0') {
                                $timeout(function () {
                                    $modalInstance.dismiss('cancel');
                                    dialogs.openAlert('创建相册','成功创建相册！','确定', function () {
                                        $timeout(function () {
                                            pictures = data.message;
                                            $rootScope.pictures = data.message;
                                        },100)
                                    });
                                    // $scope.isCreate = false;
                                })
                            } else {
                                dialogs.openAlert('数据管理',data.message, '确定', '')
                            }
                        });
                    })
                }
            },
            size: 'md',
            resolve : {
                pictures: function () {
                    return $rootScope.pictures;
                },
                upload: function () {
                    return $scope.upload;
                }
            }
        })
    };
    //编辑视频名称
    $scope.edit = function (name) {
        $modal.open({
            templateUrl: 'showEdit.html',
            controller: function ($scope,$modalInstance) {
                $scope.newTitle = name;
                $scope.cancel = function(){
                    $modalInstance.close();
                };
                $scope.ok = function () {
                    changeTitle(name, $('#newTitle').val());
                    $modalInstance.close();
                }
            },
            size: 'md'
        })
    };
    //删除相册
    $scope.removePictures = function (index) {
        dialogs.openDialog('删除相册','确定删除该相册？','确定','取消',function () {
            $timeout(function () {
                picture.deletePictures(index, 'img').then(function (data) {
                    if (data.errCode === '0') {
                        dialogs.openAlert('删除相册','成功删除相册！','确定','');
                        gainPictures();
                    } else {
                        dialogs.openAlert('删除相册',data.message, '确定','');
                    }
                });
            })
        },'')
    };
    //删除图片
    $scope.removeImg = function (index) {
        dialogs.openDialog('删除图片','确定删除该图片？','确定','取消',function () {
            $timeout(function () {
                var idx = $rootScope.pictures.findIndex(function (item) {
                    return item.text === $scope.imageName;
                });
                picture.deleteImage(index, idx, 'img').then(function (data) {
                    if (data.errCode === '0') {
                        $timeout(function () {
                            $rootScope.pictures = data.message;
                            $scope.images = data.message[idx].src;
                        })
                    } else {
                        dialogs.openAlert('删除图片',data.message, '确定','');
                    }
                })
            })
        },'')
    };
    //设为封面
    $scope.setFirst = function (index) {
        dialogs.openDialog('设置封面','确定将该图片设为封面？','确定','取消',function () {
            $timeout(function () {
                var idx = $rootScope.pictures.findIndex(function (item) {
                    return item.text === $scope.imageName;
                });
                picture.setDefault(index, idx, 'img').then(function (data) {
                    if (data.errCode === '0') {
                        $timeout(function () {
                            $rootScope.pictures = data.message;
                            $scope.images = data.message[idx].src;
                        })
                    } else {
                        dialogs.openAlert('设置封面',data.message, '确定','');
                    }
                })
            })
        },'')
    };
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
    //新建相册
    function createPictures(picturesName) {
        $timeout(function () {
            picture.setPictures(picturesName, 'img').then(function (data) {
                if (data.errCode === '0') {
                    $rootScope.pictures = data.message;
                } else {
                    dialogs.openAlert('数据管理',data.message, '确定', '')
                }
            });
        })
    }
    //修改标题
    function changeTitle(title, newTitle) {
        $timeout(function () {
            picture.setNewTitle(title, newTitle, 'img').then(function (data) {
                if(data.errCode === '0') {
                    dialogs.openAlert('修改标题','修改标题成功！','确定', function () {
                        $timeout(function () {
                            $rootScope.pictures = data.message;
                        },100)
                    })
                } else {
                    dialogs.openAlert('修改标题', data.message, '确定')
                }
            })
        })
    }

}]);