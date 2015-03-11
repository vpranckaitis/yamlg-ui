var myApp = angular.module('yamlg', []);
myApp.controller('yamlg-controller', ['$scope', '$http', function ($scope, $http) {
  'use strict'
	
  var boardWidth = 8
  var boardHeight = 8
	
  $scope.range = function(min, max, step){
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
  };
  
  $scope.board = '1111000011110000111100000000000000000000000022220000222200002222';
  $scope.getChecker = function(x, y) {
	  if (typeof y === 'undefined') {
		  return $scope.board[x];
	  } else {
		  return $scope.board[y * boardWidth + x];
	  }
  };
  
  $scope.move = function() {
	  $http.get('move/' + $scope.board).
	      success(function(data, status) {
	              $scope.board = data;
	      	  }
	      )
  }
}]);