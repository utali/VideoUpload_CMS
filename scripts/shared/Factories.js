/**
 * Created by chenxin on 15/9/24.
 */
/**
 * Created by chenxin on 15/9/22.
 */
'use strict'
var errUnknown = {
    errCode: 'unknown error',
    message: '未知错误导致数据保存时出现错误，请稍后重试或联系系统管理员。'
};
angular
    .module('theme.factories', [])
    /* ------------------------------------------------------------------
     * Begin Factory principal
     ------------------------------------------------------------------*/
    .factory('principal', function ($q, $http, $timeout) {
        var m_identity = undefined, m_authenticated = false;

        function _authenticate() {
            var defer = $q.defer();
            if (!angular.isDefined(m_identity) || !m_identity) {
                m_authenticated = false;
                localStorage.removeItem('');
                defer.resolve();
                return defer.promise;
            }
            $timeout(function () {
                $http.get(
                    '/auth/api/sign/check',
                    {headers: {sign: m_identity.sign}}
                )
                    .success(function (data) {
                        if (0 === data.errCode) {
                            m_authenticated = true;
                        }
                        defer.resolve(m_identity);
                    })
                    .error(function () {
                        m_authenticated = false;
                        localStorage.removeItem('rapid.airstore.identity');
                        defer.resolve();
                    });
            });
            return defer.promise;
        }

        function _login(data) {
            m_authenticated = true;
            m_identity = data;
            localStorage.setItem('rapid.airstore.identity', angular.toJson(m_identity));
        }

        function _isIdentityResolved() {
            _identity();
            return angular.isDefined(m_identity);
        }

        function _isAuthenticated() {
            return m_authenticated;
        }

        function _identity(force) {
            if (true === force) {
                localStorage.removeItem('rapid.airstore.identity');
                m_identity = undefined;
                m_authenticated = false;
                return m_identity;
            }
            if (angular.isDefined(m_identity) && m_identity) {

            } else {
                m_identity = angular.fromJson(localStorage.getItem('rapid.airstore.identity'));
            }
            return m_identity;
        }

        return {
            login: _login,
            isIdentityResolved: _isIdentityResolved,
            isAuthenticated: _isAuthenticated,
            authenticate: _authenticate,
            identity: _identity
        };
    })

    /* ------------------------------------------------------------------
     * End Factory principal
     ------------------------------------------------------------------*/
    /* ------------------------------------------------------------------
     * Begin Factory sysconfig
     ------------------------------------------------------------------*/
    .factory('system', function ($q, $http, $timeout) {
        return {
            listByUser: function (userSign, domain, comment, lastSysAttId, size) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.get(
                        '/auth/api/sysatt/' + domain + '/' + comment + '/' + lastSysAttId + '/' + size + '/batch',
                        {headers: {sign: userSign}}
                    )
                        .success(function (data) {
                            defer.resolve(data);
                        })
                        .error(function () {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            add: function (userSign, newSysAttData) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.post(
                        '/auth/api/sysatt',
                        newSysAttData,
                        {headers: {sign: userSign}}
                    )
                        .success(function (data) {
                            defer.resolve(data);
                        })
                        .error(function () {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            update: function (userSign, sysAttData) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.put(
                        '/auth/api/sysatt/' + sysAttData._id,
                        sysAttData,
                        {headers: {sign: userSign}}
                    )
                        .success(function (data) {
                            defer.resolve(data);
                        })
                        .error(function () {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            remove: function (userSign, sysAttId) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.put(
                        '/auth/api/removeSysatt/' + sysAttId,
                        {},
                        {headers: {sign: userSign}}
                    )
                        .success(function (data) {
                            defer.resolve(data);
                        })
                        .error(function (data) {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            // 根据给定的domain获取系统信息
            infoByDomain: function (domain) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.get(
                        '/auth/api/sysatt/' + domain
                    )
                        .success(function (data) {
                            defer.resolve(data);
                        })
                        .error(function () {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            }
        };
    })
/* ------------------------------------------------------------------
 * End Factory sysconfig
 ------------------------------------------------------------------*/
         /* ------------------------------------------------------------------
    * Begin Factory operation by user sign
    ------------------------------------------------------------------*/
    .factory('operation', function ($q, $http, $timeout) {
        return {
            // 获取指定用户所属的权限列表
            listByUser: function(userSign, operationName, memo, lastOperationId, size) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.get(
                        '/auth/api/getOperation/' +  operationName + '/' + memo + '/' + lastOperationId + '/' + size + '/batch',
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            },
            // 获取指定工作组下的所有权限显示顺序列表
            orderList: function(userSign, wkgId) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.get(
                        '/auth/api/order/operation/' + wkgId + '/batch',
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            },
            // 添加权限
            add: function(userSign, newOperation) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.post(
                        '/auth/api/saveOperation',
                        newOperation,
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    })
                });
                return defer.promise;
            },
            // 修改权限
            update: function(userSign, updOperation) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.put(
                        '/auth/api/modifyOperation/' + updOperation._id,
                        updOperation,
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            },
            // 移除权限
            remove: function(userSign, operationId) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.put(
                        '/auth/api/removeOperation/' + operationId,
                        {},
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            },
            // 调整权限显示顺序
            adjustOrder: function(userSign, wkgId, operationOrderData) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.put(
                        '/auth/api/order/operation/' + wkgId,
                        {operationIds: operationOrderData},
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            }
        }
    })
    /* ------------------------------------------------------------------
    * End Factory operation by user sign
    ------------------------------------------------------------------*/
    /* ------------------------------------------------------------------
    * Begin Factory user by user sign
    ------------------------------------------------------------------*/
    .factory('user', function ($q, $http, $timeout) {
        return {
            // 根据给定用户获取其对应的用户列表
            listByUser: function(userSign, nickName, comment, lastUserId, size) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.get(
                        '/auth/api/getUser/' + nickName + '/' + comment + '/' + lastUserId + '/' + size + '/batch',
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    })
                });
                return defer.promise;
            },
            // 添加用户
            add: function(userSign, newUser) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.post(
                        '/auth/api/saveUser',
                        newUser,
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            },
            // 修改用户
            update: function(userSign, updUser) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.put(
                        '/auth/api/modifyUser/' + updUser._id,
                        updUser,
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    })
                });
                return defer.promise;
            },
            // 移除用户
            remove: function(userSign, userId) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.put(
                        '/auth/api/removeUser/' + userId,
                        {},
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            },
            // 获取当前邀请人用户列表
            inviterListByUser: function(userSign, loginName, comment, isUse, lastInviterId, size) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.get(
                        '/auth/api/invite/user/' + loginName + '/' + comment + '/' + isUse + '/' + lastInviterId + '/' + size + '/batch',
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            },
            // 添加邀请人
            addInviter: function(userSign, newInviter) {
                var defer = $q.defer();
                $timeout(function() {
                    $http.post(
                        '/auth/api/invite',
                        newInviter,
                        {headers: {sign: userSign}}
                    )
                    .success(function(data) {
                        defer.resolve(data);
                    })
                    .error(function() {
                        defer.resolve(errUnknown)
                    });
                });
                return defer.promise;
            },
            // 修改邀请人
            updateInviter: function(userSign, updInviter) {
                return this.update(userSign, updInviter);
            },
            // 删除邀请人
            removeInviter: function(userSign, inviterId) {
                return this.remove(userSign, inviterId);
            }
        }
    })
    /* ------------------------------------------------------------------
    * End Factory user by user sign
    ------------------------------------------------------------------*/
    /* ------------------------------------------------------------------
     * Begin Factory Dialogs
     ------------------------------------------------------------------*/
    .factory('dialogs', ['$modal', '$bootbox', '$log', '$compile', 'principal', 'pinesNotifications', '$timeout','$location','$rootScope', function ($modal, $bootbox, $log, $compile, principal, pinesNotifications, $timeout, $location,$rootScope) {
        return {
            openItemList:   function (title, itemsList, itemLength, activeButton, negtiveButton, callback) {
                var modalInstance = $modal.open({
                    templateUrl: 'modalListContent.html',
                    controller:  function ($scope, $modalInstance) {
                        var stringList = '';
                        $scope.items = [];
                        angular.forEach(itemsList, function (item) {
                            if (item.content.length != 0) {
                                var itemByContent = {module: '', allowSection: ''};
                                if (item.module == '1') {
                                    itemByContent.module = '归属组版';
                                    stringList = stringList + '组版、';
                                    var str = '';
                                    angular.forEach(item.content, function (obj, index) {
                                        var string = obj == '1' ? '首页轮显' : '首页列表';
                                        str = index == 0 ? string : str + ',' + string;
                                    });
                                    itemByContent.allowSection = str;
                                } else if (item.module == '2') {
                                    stringList = stringList + '推送、';
                                    itemByContent.module = '归属推送';
                                    itemByContent.allowSection = item.content[0];
                                } else if (item.module == '3') {
                                    stringList = stringList + '相关新闻、';
                                    itemByContent.module = '归属相关新闻';
                                    var str = '';
                                    angular.forEach(item.content, function (obj, index) {
                                        str = index == 0 ? obj : str + ',' + obj;
                                    });
                                    itemByContent.allowSection = str;
                                } else if (item.module == '4') {
                                    stringList = stringList + '专题新闻、';
                                    itemByContent.module = '归属专题新闻';
                                    var str = '';
                                    angular.forEach(item.content, function (obj, index) {
                                        str = index == 0 ? obj : str + ',' + obj;
                                    });
                                    itemByContent.allowSection = str;
                                }
                                $scope.items.push(itemByContent);
                            }
                        });
                        stringList = '【' + stringList + '】';
                        stringList = stringList.replace('【、', "【");
                        stringList = stringList.replace('、】', "】");
                        $scope.errorMessage = '当前稿件归属于' + stringList + '，如撤稿则自动将该稿件从相应位置移除，是否继续撤稿？';
                        $scope.title = title;
                        $scope.aButton = activeButton;
                        $scope.nButton = negtiveButton;
                        $scope.block = 'false';
                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.showHandlesList = function () {
                            $scope.block = $scope.block == 'false' ? 'true' : 'false';
                        };

                        $scope.itemsDetail = itemLength == 1 ? true : false;
                    },
                    size:        ''
                });
                modalInstance.result.then(callback, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            },
            openDialog:     function (title, message, activeButton, negtiveButton, activeCallBack, negtiveCallBack) {
                $bootbox.dialog({
                    message: message,
                    title:   title,
                    buttons: {
                        main:   {
                            label:     activeButton,
                            className: "btn-primary",
                            callback:  activeCallBack
                        },
                        danger: {
                            label:     negtiveButton,
                            className: "btn-danger",
                            callback:  negtiveCallBack
                        }
                    }
                })
            },
            openAlert:      function (title, message, activeButton, activeCallBack) {
                $bootbox.dialog({
                    message: message,
                    title:   title,
                    buttons: {
                        main: {
                            label:     activeButton,
                            className: "btn-primary",
                            callback:  activeCallBack
                        }
                    }
                })
            },
            //3秒自动消失弹框 modify by liqq 2018-5-8
            openTimeModal:  function (message) {
                $modal.open({
                    templateUrl: 'timeoutModal.html',
                    controller:  ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.message = message;
                        $timeout(function () {
                            $modalInstance.close();
                        }, 3000)
                    }],
                    size:        'md'
                })
            },
            openImageModal: function (src) {
                var modalInstance = $modal.open({
                    templateUrl: 'imageModalContent.html',
                    controller:  ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.src = src;
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }],
                    size:        'lg'
                });
            },
            openSignError:  function (data) {
                var callback = function () {
                    principal.identity(true);
                    window.location.href = '#/login';
                    $rootScope.openSingle += 1;
                    // $location.path('/login');
                    $rootScope.signErr--;
                };
                if ($rootScope.openSingle > 0 || $rootScope.signErr >= 1) return;
                $rootScope.signErr++;
                this.openDialog('身份错误', data, '取消', "重新登录", function () {
                    $rootScope.signErr--;
                }, callback);
            },
            alertModal:     function (title, text, type) {
                pinesNotifications.notify({
                    title: title,
                    text:  text,
                    type:  type
                });
            }

        }
    }])
    /* ------------------------------------------------------------------
     * End Factory Dialogs
    /* ------------------------------------------------------------------
    * Begin Factory Forms
    ------------------------------------------------------------------*/
    .factory('forms', function () {
        return {
            check : function(name, checkFields, successCallback) {
                var aform = $(name);
                aform.form(
                    {
                        fields: checkFields,
                        revalidate: true,
                        inline: true,
                        on: 'submit',
                        duration: 40,
                        onSuccess: successCallback
                    }
                );
            },
            clearError: function(name) {
                var fields = $(name + ' .field');
                if (0 < fields.length) {
                    fields.removeClass('error');
                }
                $('.prompt.label').remove();
            },
            resetDropdown: function(domElement,defaultText) {
                var elementDom = $('#'+domElement);
                elementDom.removeClass('text').addClass('default text');
                elementDom.html(defaultText);
            }
        };
    })
    /* ------------------------------------------------------------------
    * End Factory forms
    ------------------------------------------------------------------*/
    /* ------------------------------------------------------------------
    * Begin Factory picture
    ------------------------------------------------------------------*/
    .factory('picture', function ($q, $http, $timeout) {
        return {
            setPictures: function (name, type) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.put('/picture/set/' + type,
                        {name: name}
                    )
                        .success(function(data) {
                            defer.resolve(data);
                        })
                        .error(function() {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            getPictures: function (type) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.get('/picture/get/'+ type
                    )
                        .success(function(data) {
                            defer.resolve(data);
                        })
                        .error(function() {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            deletePictures: function (index,type) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.put('/picture/delete/' + type,
                        {index: index}
                    )
                        .success(function(data) {
                            defer.resolve(data);
                        })
                        .error(function() {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            deleteImage: function (index,idx, type) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.post('/picture/delete/' + type,
                        {index: index, idx: idx}
                    )
                        .success(function(data) {
                            defer.resolve(data);
                        })
                        .error(function() {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            setDefault: function (index, idx, type) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.post('/picture/setFirst/' + type,
                        {index: index, idx: idx}
                    )
                        .success(function(data) {
                            defer.resolve(data);
                        })
                        .error(function() {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
            setNewTitle: function (oldTitle, newTitle, type) {
                var defer = $q.defer();
                $timeout(function () {
                    $http.post('/picture/editTitle/' + type,
                        {oldTitle: oldTitle, newTitle: newTitle}
                    )
                        .success(function(data) {
                            defer.resolve(data);
                        })
                        .error(function() {
                            defer.resolve(errUnknown);
                        });
                });
                return defer.promise;
            },
        };
    })
    /* ------------------------------------------------------------------
    * End Factory picture
    ------------------------------------------------------------------*/
    /* ------------------------------------------------------------------
    * Begin Factory EChartsOptionsConfig
    ------------------------------------------------------------------*/
    .factory('EChartsOptionsConfig', function(){

        var pieOptions = function pieOptions(config, dataMap) {
            return {
              color: ['#4697ce', '#4acf99'],
              title: {
                text: config.chartName,
                x: 'center'
              },
              tooltip: {
                show: true,
                showContent: true,
                trigger: 'item',
                formatter: '{a} <br> {b}：{c} <br> 占总量：{d}%',
                backgroundColor: '#364153',
                textStyle: {
                  color: '#fff',
                }
              },
              legend: {
                orient: 'vertical',
                right: 'right',
                data: dataMap.pie.legend
              },
              selectedMode: 'single',
              series: [
                {
                  name: config.chartName,
                  type: 'pie',
                  radius: '55%',
                  center: ['50%', '60%'],
                  data: dataMap.pie.series,
                  itemStyle: {
                    normal: {

                    },
                    emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }
                }
              ]
            };
        };

        var heatMapOptions = function heatMapOptions(config, dataMap) {
            return {
                title: {
                    text: config.chartName,
                    x: 'center'
                },
                tooltip: {
                    position: 'top',
                    backgroundColor: '#364153',
                    textStyle: {
                      color: '#fff',
                    }
                },
                gird: {
                    height: '20%',
                    y: '0%'
                },
                xAxis: dataMap.heatmap.xAxis,
                yAxis: dataMap.heatmap.yAxis,
                visualMap: {
                    min: 1,
                    max: 10,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '0%'
                },
                series: dataMap.heatmap.series
            }
        };

        var stackingbarOptions = function stackingbarOptions(config, dataMap) {
            return {
                color: ['#4697ce', '#4acf99'],
                title: {
                    text: config.chartName,
                    x: 'center'
                },
                tooltip: {
                    trigger: config.chartTrigger || 'axis',
                    axisPointer : {
                        type : 'shadow'
                    },
                    backgroundColor: '#364153',
                    textStyle: {
                      color: '#fff',
                    }
                },
                legend: {
                    top: 'top',
                    left: 'left',
                    data: dataMap.stackingbar.legend
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: dataMap.stackingbar.xAxis,
                yAxis : dataMap.stackingbar.yAxis,
                series : dataMap.stackingbar.series
            };
        };

        var lineOptions = function lineOptions(config, dataMap) {
            return {
                color: ['#a2d4f0'],
                title: {
                    text: config.chartName,
                    x: 'center'
                },
                tooltip: {
                    trigger: config.chartTrigger || 'axis',
                    formatter: function (params, ticket, callback) {
                        var _p = params[0],
                            content = '';
                        content += _p.seriesName + '<br>';
                        content += _p.name + '<br>';
                        content += '访问量：' + (_p.value || 0 );
                        return content
                    },
                    backgroundColor: '#364153',
                    textStyle: {
                      color: '#fff',
                    }
                },
                dataZoom: {
                    //type: 'inside',
                    //start: 60,
                    //end: 80
                },
                legend: dataMap.line.legend,
                xAxis: dataMap.line.xAxis,
                yAxis: dataMap.line.yAxis,
                series: dataMap.line.series
            };
        };

        return {
            pieOptions: pieOptions, // 饼状图绘制参数
            heatMapOptions: heatMapOptions, // 热力图绘制参数
            stackingbarOptions: stackingbarOptions, // 堆叠柱状图绘制参数
            lineOptions: lineOptions // 线状图绘制参数
        }
    })
    /* ------------------------------------------------------------------
    * End Factory EChartsOptionsConfig
    ------------------------------------------------------------------*/