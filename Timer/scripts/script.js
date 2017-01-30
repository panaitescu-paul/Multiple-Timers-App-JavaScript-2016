app = angular.module("Application", []);

app.controller("TimerController", ['$scope', function($scope) {

  $scope.guid = function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
  }

  $scope.getIndexOfObject = function(prop, value){
    for (var i = 0; i < $scope.timersList.length ; i++) {
      if ($scope.timersList[i][prop] === value) {
        return i;
      }
    }
  }

  $scope.view = 1;
  $scope.timersList = [];
  $scope.timer = [ 
  { id: null,
    toggle: false,
    totalSeconds: 0,
    title: '',
    description: ''
  }];

  $scope.goToEdit = function () {
    $scope.view = 2;
  };

  $scope.goToOverview = function () {
    $scope.view = 3;
  };

  $scope.goToList = function () {
    $scope.view = 1;
  };

  $scope.cancelCb = function () {
    $scope.timersList.pop();
  };

  $scope.deleteCb = function () {
    $scope.timersList.splice($scope.selectedItem, 1);
  };

}]);

app.directive('view1',['$timeout', function($timeout) {
  return {
    restrict: 'E',
    templateUrl: 'templates/view1.html',
    scope:{
      list: '=',
      selection: '=',
      editCb: '&',
      overviewCb: '&',
      toggle: '='
    },
    link: function(scope, elem, attr) {

      scope.add = function() {
        scope.list.push({title: 'Timer ' + scope.list.length, hours: null, min: null, sec: null});
        scope.selection = scope.list.length - 1;
        scope.editCb();
      }

      scope.select = function (i) {
        console.log('INDEX', i);
        scope.selection = i; 
        scope.overviewCb();
      }

      scope.startTimer = function (timer) {
        var hours, minutes, seconds;
        if (timer.totalSeconds <= 0) {
          return;
        }
        var interval = setInterval(function () {
          timer.totalSeconds--;
          if (timer.totalSeconds <= 0) {
            timer.toggle = false;
            clearInterval(interval);
          }
          hours = parseInt(timer.totalSeconds / 3600, 10) % 24;
          minutes = parseInt(timer.totalSeconds / 60, 10) % 60;
          seconds = parseInt(timer.totalSeconds % 60, 10);

          hours = hours < 10 ? "0" + hours : hours;
          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;

          timer.displayedTime = hours + ":" + minutes + ":" + seconds;
          scope.$apply();
        }, 1000);
        return interval;
      }

      scope.showTimerBeforeStart = function (timer) {
        var hours, minutes, seconds;
        hours = parseInt(timer.totalSeconds / 3600, 10) % 24;
        minutes = parseInt(timer.totalSeconds / 60, 10) % 60;
        seconds = parseInt(timer.totalSeconds % 60, 10);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        timer.displayedTime = hours + ":" + minutes + ":" + seconds;
      }

      scope.timerSwitch = function (timer) {
        if (timer.toggle) {
          if (timer.totalSeconds > 1) {
            timer.intervalId = scope.startTimer(timer);
          } else {
            $timeout(function() {
              timer.toggle = false;
            }, 500);
          }
        } else if (!timer.toggle && timer.intervalId) {
          clearInterval(timer.intervalId);
          scope.showTimerBeforeStart(timer);
        } else if (!timer.toggle) {
          scope.showTimerBeforeStart(timer);
        }

      }
    }
  };
}]);

app.directive('view2', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/view2.html',
    scope:{
      item: '=',
      listCb: '&',
      cancelCb: '&'
    },
    link: function(scope, elem, attr) {
      scope.$watch('item', function (newVal){
        scope._item =  angular.copy(newVal);
      });

      scope.save = function() {
        scope.item = angular.copy(scope._item);
        console.log('call CONVERT TO SEC');
        scope.item.totalSeconds = scope.convertToSeconds(scope._item.hours, scope._item.min, scope._item.sec);
        scope.item.toggle = false;
        scope.convertToHMS(scope.item);
        scope.listCb();
      }

      scope.convertToSeconds = function  (hours, minutes, seconds) {
        console.log('CONVERT TO SEC');

        // null || 0
        
        hours = parseInt(hours, 10) || 0;
        minutes = parseInt(minutes, 10) || 0;
        seconds = parseInt(seconds, 10) || 0;

        totalSeconds = hours * 60*60 + minutes * 60 + seconds;
        return totalSeconds;
      }
      scope.convertToHMS = function (timer) {
        var hours, minutes, seconds;
        hours = parseInt(timer.totalSeconds / 3600, 10) % 24;
        minutes = parseInt(timer.totalSeconds / 60, 10) % 60;
        seconds = parseInt(timer.totalSeconds % 60, 10);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timer.displayedTime = hours + ":" + minutes + ":" + seconds;
      }

      scope.validateText = function (evt) {
        var regex = new RegExp("^[a-zA-Z ]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
          event.preventDefault();
          return false;
        }
      }

      scope.validateLength = function  (evt) {
        if (evt.target.value.length >= 2) {
          evt.target.value = evt.target.value.slice(-1);
        }
      }

      scope.validateMinMax = function (evt, inputNo) {
        var regex = new RegExp("^[0-9]+$");
        if (!regex.test(evt.target.value)) {
          evt.target.value = '00';
        }
        if (parseInt(evt.target.value) > 59) {
          evt.target.value = evt.target.value.slice(-1);
        }
        if (inputNo == 1) {
          if (parseInt(evt.target.value) > 23) {
            evt.target.value = evt.target.value.slice(-1);
          }
        }
      }
    }
  };
});

app.directive('view3',['$timeout', function($timeout) {
  return {
    restrict: 'E',
    templateUrl: 'templates/view3.html',
    scope:{
      item: '=',
      listCb: '&',
      deleteCb: '&',
      toggle: '='
    },
    link: function(scope, elem, attr) {

      scope.startTimer = function (timer) {
        var hours, minutes, seconds;
        if (timer.totalSeconds <= 0) {
          return;
        }
        var interval = setInterval(function () {
          timer.totalSeconds--;
          if (timer.totalSeconds <= 0) {
            timer.toggle = false;
            clearInterval(interval);
          }
          hours = parseInt(timer.totalSeconds / 3600, 10) % 24;
          minutes = parseInt(timer.totalSeconds / 60, 10) % 60;
          seconds = parseInt(timer.totalSeconds % 60, 10);

          hours = hours < 10 ? "0" + hours : hours;
          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;

          timer.displayedTime = hours + ":" + minutes + ":" + seconds;
          scope.$apply();
        }, 1000);
        return interval;
      }

      scope.showTimerBeforeStart = function (timer) {
        var hours, minutes, seconds;
        hours = parseInt(timer.totalSeconds / 3600, 10) % 24;
        minutes = parseInt(timer.totalSeconds / 60, 10) % 60;
        seconds = parseInt(timer.totalSeconds % 60, 10);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timer.displayedTime = hours + ":" + minutes + ":" + seconds;
      }

      scope.timerSwitch = function (timer) {
        if (timer.toggle) {
          if (timer.totalSeconds > 1) {
            timer.intervalId = scope.startTimer(timer);
          } else {
            $timeout(function() {
              timer.toggle = false;
            }, 500);
          }
        } else if (!timer.toggle && timer.intervalId) {
          clearInterval(timer.intervalId);
          scope.showTimerBeforeStart(timer);
        } else if (!timer.toggle) {
          scope.showTimerBeforeStart(timer);
        }

      }

      scope.clearInterval = function () {
        clearInterval(scope.item.intervalId);
      }
    }
  };
}]);

app.directive('stopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind('click', function (e) {
        e.stopPropagation();
      });
    }
  };
});
