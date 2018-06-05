/**
 * Created by liqiaoqiao on 2018/5/30.
 */
'use strict';

var app = angular.module('themesApp');
app.controller('ctrl-more-videos', ['$scope','$rootScope','$timeout', 'dialogs','picture','$modal',function ($scope,$rootScope,$timeout, dialogs,picture, $modal) {
    $scope.mainTitle = '视频';
    $scope.isInfo = $rootScope.isInfo;
    $scope.infoFile = 'views/video.html';
    $scope.percents = 0;
    $scope.showVideos = function (video) {
        $scope.isInfo = true;
        $scope.videoText = video.text;
        $scope.videoSrc = video.src;
    };
    //返回
    $scope.cancel = function () {
        $scope.isInfo = false;
    };

    //上传视频
    $scope.upload = function ($flow) {
        $scope.percents = 0;
        if ($flow.files.length == 0){
            dialogs.openAlert('视频上传','仅支持持MP4、AVI、FLV、SWF文件','确定');
            return;
        }
        var file = $flow.files[0].file;
        if (file) {
            if (file.size > 1024*1024*1024) {
                dialogs.openAlert('视频上传','上传视频不能大于1G！','确定');
                return;
            }
            $scope.isUploaded = true;
            var fileSize = 0;
            if (file.size > 1024 * 1024){
                fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
            }else{
                fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
            }
            document.getElementById('fileName').innerHTML = '名称: ' + file.name;
            document.getElementById('fileSize').innerHTML = '大小: ' + fileSize;
            document.getElementById('fileType').innerHTML = '类型: ' + file.type;
        }
        // prepare XMLHttpRequest
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload/video');
        //upload successfully
        xhr.addEventListener('load',function(e) {
            $scope.isUploaded = false;
            var data = $.parseJSON(e.target.responseText);
            if ( data.errCode === "0" ) {
                dialogs.openAlert('上传视频','视频上传成功！','确定',function () {
                    gainVideos();
                })
            } else {
                dialogs.openAlert('上传视频',data.message, '确定')
            }
        }, false);

        // file upload complete
        xhr.addEventListener('loadend', function () {

        }, false);

        //上传失败
        xhr.addEventListener('error', function() {

        }, false);

        xhr.upload.addEventListener('progress', uploadProgress, false);

        // prepare FormData
        var formData = new FormData();
        formData.append('videoFile', $flow.files[0].file);
        xhr.send(formData);
    };
    //上传进度
    function uploadProgress(evt) {
        if (evt.lengthComputable) {
            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
            $timeout(function () {
                $scope.percents = percentComplete;
            });
            document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
        }
        else {
            document.getElementById('progressNumber').innerHTML = '无法计算';
        }
    }
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
    //删除视频
    $scope.removeVideos = function (index) {
        dialogs.openDialog('删除视频','确定删除该视频？','确定','取消',function () {
            $timeout(function () {
                picture.deletePictures(index, 'video').then(function (data) {
                    if (data.errCode === '0') {
                        dialogs.openAlert('删除视频','成功删除视频！','确定',function () {
                            $timeout(function () {
                                $rootScope.videos = data.message;
                            },100)
                        });
                    } else {
                        dialogs.openAlert('删除视频',data.message, '确定','');
                    }
                });
            })
        },'')
    };
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
    //修改标题
    function changeTitle(title, newTitle) {
        $timeout(function () {
            picture.setNewTitle(title, newTitle, 'video').then(function (data) {
                if(data.errCode === '0') {
                    dialogs.openAlert('修改标题','修改标题成功！','确定', function () {
                        $timeout(function () {
                            $rootScope.videos = data.message;
                            $scope.videoText = newTitle;
                        },100)
                    })
                } else {
                    dialogs.openAlert('修改标题', data.message, '确定')
                }
            })
        })
    }
}]);