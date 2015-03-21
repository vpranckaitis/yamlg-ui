var myApp = angular.module('yamlg', []);
myApp.controller('yamlg-controller', ['$scope', '$http', function ($scope, $http) {
  'use strict'
	
  window.d = $scope;
  
  var boardWidth = 8
  var boardHeight = 8
  var boardSize = boardWidth * boardHeight;
  $scope.selectedChecker = boardSize;
  
  $scope.availableMoves = new Array()
  for (var i = 0; i < boardSize + 1; i++) {
	  $scope.availableMoves[i] = new Array()
  }
	
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
		  return $scope.board[$scope.coordToPos(x, y)];
	  }
  };
  
  $scope.move = function(p1, p2) {
	  var t = null;
	  if (p1 < p2) {
		  t = $scope.board.substr(0, p1) + 
		      $scope.board[p2] + 
		      $scope.board.substr(p1 + 1, p2 - p1 - 1) + 
		      $scope.board[p1] + 
		      $scope.board.substr(p2 + 1);
	  } else {
		  t = $scope.board.substr(0, p2) + 
	      	  $scope.board[p1] + 
	      	  $scope.board.substr(p2 + 1, p1 - p2 - 1) + 
	      	  $scope.board[p2] + 
	      	  $scope.board.substr(p1 + 1);
	  }
	  $scope.board = t;
	  
	  $http.post('move/0', {board: $scope.board}).
	      success(function(data, status) {
	              $scope.board = data.board;
	              $scope.availableMoves = data.moves;
	              $scope.availableMoves[boardSize] = new Array()
	      	  }
	      )
  };
  
  $scope.selectChecker = function(x, y) {
	  var p = $scope.coordToPos(x, y);
	  if ($scope.isCandidate(x, y)) {
		  $scope.move($scope.selectedChecker, p);
		  $scope.availableMoves = $scope.availableMoves.map(function() { return new Array() });
		  $scope.selectedChecker = boardSize;
	  } else if ($scope.selectedChecker == p) {
		  $scope.selectedChecker = boardSize;
	  } else {
		  $scope.selectedChecker = p;
	  }
  };
  
  $scope.isCandidate = function(x, y) {
	  var p = $scope.coordToPos(x, y);
	  var candidateCheckers = $scope.availableMoves[$scope.selectedChecker];
	  for (var i = 0; i < candidateCheckers.length; i++) {
		  if (candidateCheckers[i] == p) {
			  return true;
		  }
	  }
	  return false;
  };
  
  $scope.isSelected = function(x, y) {
	  return $scope.coordToPos(x, y) == $scope.selectedChecker;
  };
  
  $scope.coordToPos = function(x, y) {
	  return y * boardWidth + x;
  };
}]);