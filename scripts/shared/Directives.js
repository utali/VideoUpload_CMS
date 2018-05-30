'use strict'

angular
  .module('theme.directives', [])
  .directive('disableAnimation', ['$animate', function($animate){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            $attrs.$observe('disableAnimation', function(value){
                $animate.enabled(!value, $element);
            });
        }
    }
  }])
  .directive('slideOut', function() {
    return {
      restrict: 'A',
      scope: {
        show: '=slideOut'
      },
      link: function (scope, element, attr) {
        element.hide();
        scope.$watch('show', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            element.slideToggle({
              complete: function () { scope.$apply(); }
            });
          }
        });
      }
    }
  })
  .directive('slideOutNav', ['$timeout', function($t) {
    return {
      restrict: 'A',
      scope: {
        show: '=slideOutNav'
      },
      link: function (scope, element, attr) {
        scope.$watch('show', function (newVal, oldVal) {
          if ($('body').hasClass('collapse-leftbar')) {
            if (newVal == true)
              element.css('display', 'block');
            else
              element.css('display', 'none');
            return;
          }
          if (newVal == true) {
            element.slideDown({
              complete: function () {
                $t(function () { scope.$apply() })
              }
            });
          } else if (newVal == false) {
            element.slideUp({
              complete: function () {
                $t(function () { scope.$apply() })
              }
            });
          }
        });
      }
    }
  }])
  .directive('panel', function(){
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        panelClass: '@',
        heading: '@',
        panelIcon: '@'
      },
      templateUrl: 'templates/panel.html',
    }
  })
  .directive('pulsate', function () {
    return {
      scope: {
        pulsate: '='
      },
      link: function (scope, element, attr) {
        // stupid hack to prevent FF from throwing error
        if (element.css('background-color') == "transparent") {
          element.css('background-color', "rgba(0,0,0,0.01)");
        }
        $(element).pulsate(scope.pulsate);
      }
    }
  })
  .directive('prettyprint', function() {
    return {
    restrict: 'C',
        link: function postLink(scope, element, attrs) {
            element.html(prettyPrintOne(element.html(),'',true));
        }
    };
  })
  .directive("passwordVerify", function() {
    return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(function() {
            var combined;

            if (scope.passwordVerify || ctrl.$viewValue) {
               combined = scope.passwordVerify + '_' + ctrl.$viewValue; 
            }                    
            return combined;
        }, function(value) {
            if (value) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordVerify;
                    if (origin !== viewValue) {
                        ctrl.$setValidity("passwordVerify", false);
                        return undefined;
                    } else {
                        ctrl.$setValidity("passwordVerify", true);
                        return viewValue;
                    }
                });
            }
        });
     }
    };
  })
  .directive('backgroundSwitcher', function () {
    return {
      restrict: 'EA',
      link: function (scope, element, attr) {
        $(element).click( function () {
          $('body').css('background', $(element).css('background'));
        });
      }
    };
  })
  .directive('panelControls', [function() {
    return {
      restrict: 'E',
      require: '?^tabset',
      link: function(scope, element, attrs, tabsetCtrl) {
        var panel = $(element).closest('.panel');
        if (panel.hasClass('.ng-isolate-scope') == false) {
          $(element).appendTo(panel.find('.options'));
        }
      }
    };
  }])
  .directive('panelControlCollapse', function () {
    return {
      restrict: 'EAC',
      link: function (scope, element, attr) {
        element.bind('click', function () {
          $(element).toggleClass("fa-chevron-down fa-chevron-up");
          $(element).closest(".panel").find('.panel-body').slideToggle({duration: 200});
          $(element).closest(".panel-heading").toggleClass('rounded-bottom');
        })
        return false;
      }
    };
  })
  .directive('icheck', function($timeout, $parse) {
      return {
          require: '?ngModel',
          link: function($scope, element, $attrs, ngModel) {
              return $timeout(function() {
                  var parentLabel = element.parent('label');
                  if (parentLabel.length)
                    parentLabel.addClass('icheck-label');
                  var value;
                  value = $attrs['value'];

                  $scope.$watch($attrs['ngModel'], function(newValue){
                      $(element).iCheck('update');
                  })

                  return $(element).iCheck({
                      checkboxClass: 'icheckbox_minimal-blue',
                      radioClass: 'iradio_minimal-blue'

                  }).on('ifChanged', function(event) {
                      if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                          $scope.$apply(function() {
                              return ngModel.$setViewValue(event.target.checked);
                          });
                      }
                      if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                          return $scope.$apply(function() {
                              return ngModel.$setViewValue(value);
                          });
                      }
                  });
              });
          }
      };
  })
  .directive('knob', function () {
    return {
      restrict: 'EA',
      template: '<input class="dial" type="text"/>',
      scope: {
        options: '='
      },
      replace: true,
      link: function (scope, element, attr) {
        $(element).knob(scope.options);
      }
    }
  })
  .directive('uiBsSlider', ['$timeout', function ($timeout) {
    return {
      link: function (scope, element, attr) {
        // $timeout is needed because certain wrapper directives don't
        // allow for a correct calculaiton of width
        $timeout(function () {
          element.slider();
        });
      }
    };
  }])
  .directive('tileLarge', function() {
    return {
      restrict: 'E',
      scope: {
        item: '=data'
      },
      templateUrl: 'templates/tile-large.html',
      replace: true,
      transclude: true
    }
  })
  .directive('tileMini', function() {
    return {
      restrict: 'E',
      scope: {
        item: '=data'
      },
      replace: true,
      templateUrl: 'templates/tile-mini.html'
    }
  })
  .directive('tile', function() {
    return {
      restrict: 'E',
      scope: {
        heading: '@',
        type: '@'
      },
      transclude: true,
      templateUrl: 'templates/tile-generic.html',
      link: function (scope, element, attr) {
        var heading = element.find('tile-heading');
        if (heading.length) {
          heading.appendTo(element.find('.tiles-heading'));
        }
      },
      replace: true
    }
  })
  .directive('jscrollpane', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      scope: {
        options: '=jscrollpane'
      },
      link: function (scope, element, attr) {
        $timeout( function () {
          if (navigator.appVersion.indexOf("Win")!=-1)
            element.jScrollPane($.extend({mouseWheelSpeed: 20},scope.options))
          else
            element.jScrollPane(scope.options);
          element.on('click', '.jspVerticalBar', function(event) { event.preventDefault(); event.stopPropagation(); });
          element.bind('mousewheel', function(e) {
            e.preventDefault();
          });
        });
      }
    };
  }])
  // specific to app
  .directive('stickyScroll', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        function stickyTop() {
            var topMax = parseInt(attr.stickyScroll);
            var headerHeight = $('header').height();
            if (headerHeight>topMax) topMax = headerHeight;
            if ($('body').hasClass('static-header') == false)
              return element.css('top', topMax+'px');
            var window_top = $(window).scrollTop();
            var div_top = element.offset().top;
            if (window_top < topMax) {
                element.css('top', (topMax-window_top)+'px');
            } else {
                element.css('top', 0+'px');
            }
        }

        $(function () {
            $(window).scroll(stickyTop);
            stickyTop();
        });
      }
    }
  })
  .directive('rightbarRightPosition', function () {
    return {
      restrict: 'A',
      scope: {
        isFixedLayout: '=rightbarRightPosition'
      },
      link: function (scope, element, attr) {
        scope.$watch('isFixedLayout', function (newVal, oldVal) {
          if (newVal!=oldVal) {
            setTimeout( function () {
              var $pc = $('#page-content');
              var ending_right = ($(window).width() - ($pc.offset().left + $pc.outerWidth()));
              if (ending_right<0) ending_right=0;
              $('#page-rightbar').css('right',ending_right);
            }, 100);
          }
        });
      }
    };
  })
  .directive('fitHeight', ['$window', '$timeout', '$location', function ($window, $timeout, $location) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attr) {
         function resetHeight () {
           var horizontalNavHeight = $('nav.navbar').height();
           var viewPortHeight = $(window).height()-$('header').height()-horizontalNavHeight;
           var contentHeight = $('#page-content').height();
           if (viewPortHeight>contentHeight)
             $('#page-content').css('min-height', viewPortHeight+'px');
         }
         setInterval(resetHeight, 1000);
         $(window).on('resize', resetHeight);
      }
    };
  }])
  .directive('jscrollpaneOn', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      scope: {
        applyon: '=jscrollpaneOn'
      },
      link: function (scope, element, attr) {
        scope.$watch('applyon', function (newVal) {
          if (newVal == false) {
            var api = element.data('jsp');
            if (api) api.destroy();
            return;
          }
          $timeout( function () {
            element.jScrollPane({autoReinitialise:true});
          });
        });
      }
    };
  }])
  .directive('backToTop', function () {
    return {
      restrict: 'AE',
      link: function (scope, element, attr) {
        element.click( function (e) {
          $('body').scrollTop(0);
        });
      }
    }
  })
  .directive('hintModal',function(){
    return {
        restrict: 'E',
        transclude: false,
        replace: true,
        scope: {
            name: '@',
            title: '@',
            hint: '@',
            hintColor: '@',
            showButtonCancel: '@',
            buttonDoneTitle: '@',
            buttonDoneColor: '@'
        },
        template:
            '<script type="text/ng-template" id="hintModal.html">' +
                '<div class="modal-header {{ name }}">' +
                    '<h3 class="modal-title">{{ title }}</h3>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<h3 class="{{ hintColor }}">{{ hint }}</h3>' +
                '</div>' +
                '<div class="modal-footer">' +
                    '<button class="btn btn-warning" style="display: {{ showButtonCancel }} !important;">取消</button>' +
                    '<button class="btn btn-primary {{ buttonDoneColor }}">{{ buttonDoneTitle }}</button>' +
                '</div>' +
            '</script>'
    };
  })
  .directive('signErrorHintModal',function(){
    return {
        restrict: 'E',
        transclude: false,
        replace: true,
        template:
            '<script type="text/ng-template" id="signErrorHintModal.html">' +
                '<div class="modal-header hintSignError">' +
                    '<h3 class="modal-title">{{ title }}</h3>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<h3>{{ error }}</h3>' +
                '</div>' +
                '<div class="actions">' +
                    '<button class="btn btn-primary">重新登录</button>' +
                '</div>' +
            '</script>' ,
        scope: {
            title: '@',
            error: '@'
        }
    };
  })

  /**
   * echarts directive
   */
  .directive('echarts', function(EChartsOptionsConfig) {
    return {
      restrict: 'EA',
      scope: {
        chartData: '=',
        chartClb: '='
      },
      controller: function($scope) {
        $scope.showLoading = function(element) {
          var $target = $(element);
          // loading html
          var loadingHtml = '<div id="loadingIcon" style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: rgba(0,0,0,.5);"><div style="position: relative;height: 100%;"><img src="http://localhost:8038/modules/statistics/channel/loading.jpg" style="position: absolute;left: 50%;top: 50%;margin-left: -50px;margin-top: -50px;"/></div></div>'
          if($target.length) {
            $target.css('position', 'relative');
            $target.append(loadingHtml).fadeIn(150);
          }
        }
        $scope.hideLoading = function() {
          // 加载完成，移除loading
          if($('#loadingIcon').length) {
            $('#loadingIcon').fadeOut(150, function() {
              $(this).remove();
            });
          }
        }
      },
      link: function(scope, element, attrs) {
        var _mainChartData = null; // 绘制主图表的数据

        var echartInstance = echarts.init($(element)[0]); // echarts实例

        // scope.showLoading(element);
        echartInstance.showLoading();
        scope.$watch('chartData', function(newValue, oldValue) {
          if(newValue !== oldValue) {
            // scope.hideLoading();
            echartInstance.hideLoading();
          }
          _mainChartData = scope.chartData;
          if(!_mainChartData) return;
          // 格式化数据
          var dataMap = _dataFormatter(_mainChartData);
          // 绘制图表
          _drwaECharts(dataMap);
        });

        /**
         * 格式化数据
         * 根据不同图表，将数据格式成对应形式
         */
        function _dataFormatter(data) {
          var dataMap = {};
          switch (attrs.chartType) {
            case 'pie':
              dataMap = {
                'pie': {
                  'legend': [],
                  'series': []
                }
              };
              dataMap.pie.legend = data.legend.data;
              dataMap.pie.series = data.series.data;
            break;

            case 'stackingbar':
              dataMap = {
                'stackingbar': {
                  'legend': [],
                  'xAxis': [],
                  'yAxis': [],
                  'series': []
                }
              };

              // 根据数据长度 更改表格的高度
              // 注意，echarts 表格的会自动根据所给数据的长度，来自动将坐标轴下表隐藏
              // 既：如果一组数据有20个，而所给绘制表给元素的高度或者宽度只有100px，切着100px不能容纳下这20个元素的宽度
              // 那么 echarts 会自动隐藏掉一部分坐标轴的下标
              // 1 2 3 4 5 6 7 8 9 --- 原来数据
              // 1 3 5 7 9 --- 显示数据
              // 如果先绘制表格，再填充数据，则坐标下标还是不会显示出来
              // 解决办法就是先得到数据再开始绘制表格 或者 使用 echarts.resize 方法重绘表格
              var l = data.yAxis[0].data.length,
                perOffset = 60;
              element.height(l * perOffset);

              // 划分 y 轴的内容，12个字一换行
              data.yAxis[0].data.forEach(function(element, index, array) {
                var splitLength = 15,
                    splitTimes = Math.floor(element.length/splitLength),
                    a = [],
                    b = '';

                a = element.split('');
                for(var i = 0; i <= splitTimes; i++) {
                  a.splice(splitLength * (i+1) + i, 0, '\n');
                }
                b = a.join('');
                array[index] = b;
              });

              dataMap.stackingbar.legend = data.legend.data;
              dataMap.stackingbar.xAxis = data.xAxis;
              dataMap.stackingbar.yAxis = data.yAxis;
              dataMap.stackingbar.series = data.series;

            break;

            case 'line':
              dataMap = {
                'line': {
                  'legend': {},
                  'xAxis': [],
                  'yAxis': [],
                  'series': []
                }
              };
              dataMap.line.legend = data.legend;
              dataMap.line.xAxis = data.xAxis;
              dataMap.line.yAxis = data.yAxis;
              dataMap.line.series = data.series;
            break;

            case 'heatmap':
              var dataMap = {
                'heatmap': {
                  'xAxis': {},
                  'yAxis': {},
                  'series': []
                }
              };
              dataMap.heatmap.xAxis = data.xAxis;
              dataMap.heatmap.yAxis = data.yAxis;
              dataMap.heatmap.series = data.series;
            break;
          }
          console.log(dataMap);

          return dataMap;
        }

        /*
         *  绘制图表
         */
        function _drwaECharts(dataMap) {
          var options = {};
          switch (attrs.chartType) {
            case 'pie':
              options = EChartsOptionsConfig.pieOptions(attrs, dataMap);
            break;
            case 'heatmap':
              options = EChartsOptionsConfig.heatMapOptions(attrs, dataMap);
            break;
            case 'stackingbar':
              options = EChartsOptionsConfig.stackingbarOptions(attrs, dataMap);
            break;
            case 'line':
              options = EChartsOptionsConfig.lineOptions(attrs, dataMap);
            break;
          }
          
          echartInstance.setOption(options);
          echartInstance.resize();
          // 绑定多图联动
          echartInstance.group = attrs.chartGroup;
          echarts.connect(attrs.chartGroup);
          // 监听图标的鼠标事件
          echartInstance.on('click', function(param) {
            // 将点击的参数传入 callback，根据参数设置callback
            scope.chartClb(param, attrs.chartLinkage);
          });
        }

      }
    }
  })


