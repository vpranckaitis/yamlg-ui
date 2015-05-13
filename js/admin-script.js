var myApp = angular.module('yamlg', ['ngCookies']);
myApp.controller('yamlg-controller', ['$scope', '$http', '$cookies', function ($scope, $http, $cookies) {
  'use strict'
	
  window.d = $scope;
  
  var limit = 20;
  var boardWidth = 8;
  var boardHeight = 8;
  var boardSize = boardWidth * boardHeight;
  
  $scope.boards = [''];
  $scope.currentTurn = 0;
  
  $scope.gameMetadatas = new Array();
  $scope.hasPrevious = false;
  $scope.hasNext = false;
  
  $scope.learn = new Array();
  
  $scope.bots = new Array();
  
  $scope.botToTeach = '';
  
  $scope.bot1 = '';
  $scope.bot2 = '';
  $scope.gameCount = 1;
  
  $scope.message = '';
  
  $scope.botForm = { 'name': '', 'ip': '0.0.0.0', 'port': 0, 'difficulty': 0, alive: false };
	
  $scope.range = function(min, max, step){
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
  };
  
  $scope.coordToPos = function(x, y) {
	  return y * boardWidth + x;
  };
  
  $scope.getChecker = function(x, y) {
	  if (typeof y === 'undefined') {
		  return $scope.boards[$scope.currentTurn][x];
	  } else {
		  return $scope.boards[$scope.currentTurn][$scope.coordToPos(x, y)];
	  }
  };
  
  window.getMetadatas = function(offset, limit) {
	  $http.get('games?limit=' + limit + (offset >= 0 ? '&offset=' + offset : '')).
	      success(function(data, status) {
	    	  document.getElementById('multicheck').indeterminate = false;
	    	  $scope.gameMetadatas = data.metadatas;
	    	  $scope.hasPrevious = data.hasPrevious;
	    	  $scope.hasNext = data.hasNext;
	      })
  };
  
  $scope.showMessage = function(message) {
	  $scope.message = message;
	  var element = document.getElementById('message-box');
	  element.className = '';
	  window.setTimeout(function() {
		  document.getElementById('message-box').className = 'fade-out';
	  }, 2000);
  }
  
  $scope.getBots = function() {
	  $http.get('bots').success(function(data, status) {
		  $scope.bots = data;
	  });
  };
  
  $scope.createBot = function() {
	  $http.post('bots', $scope.botForm).success(function(data, status) {
		  $scope.message = 'bot created';
		  $scope.getBots();
	  });
  };
  
  $scope.updateBot = function(bot) {
	  var b = {'name': bot.name, 'ip' : bot.ip, 'port': bot.port, 'difficulty': bot.difficulty, 'alive': bot.alive};
	  $http.put('bots/' + bot.id, b).success(function(data, status) {
		  $scope.getBots();
	  });
  };
  
  $scope.getNextPage = function() {
	  var offset = $scope.gameMetadatas[$scope.gameMetadatas.length - 1].id - 1;
	  window.getMetadatas(offset, limit);
  }
  
  $scope.getPreviousPage = function() {
	  var offset = $scope.gameMetadatas[0].id + limit;
	  window.getMetadatas(offset, limit);
  }
  
  $scope.getGame = function(id) {
	  $http.get('games/' + id).success(function(data, status) {
		  $scope.currentTurn = 0;
		  if (typeof data.boards != 'undefined' && data.boards.length != 0) {
			  $scope.boards = data.boards.map(function(board) { return board.board });
	      } else {
	    	  $scope.boards = [''];
	      }
	  })
  }
  
  $scope.sendLearn = function() {
	  var ids = $scope.learn.
	      map(function(val, i) { 
		    if (val == null) return -1; 
		    else return i }
	      ).filter(function(val, i) { 
			return val != -1 }
		  );
	  $http.put('bots/' + $scope.botToTeach + '/learn', {'ids': ids}).success(function(data, status) {
		  $scope.showMessage('learning data sent');
	  });
  }
  
  $scope.changeTurn = function(n) {
	  $scope.currentTurn += n;
  }
  
  $scope.checkAll = function() {
	  var s = !$scope.multiChecked();
	  for (var i = 0; i < $scope.gameMetadatas.length; i++) {
		  $scope.learn[$scope.gameMetadatas[i].id] = s;
	  }
	  document.getElementById('multicheck').indeterminate = false;
  }
  
  $scope.multiChecked = function() {
	  var c1 = true;
	  var c2 = false;
	  for (var i = 0; i < $scope.gameMetadatas.length; i++) {
		  var c = $scope.learn[$scope.gameMetadatas[i].id];
		  c1 = c1 && c;
		  c2 = c2 || c;
	  }
	  if (c1 == true) {
		  return true;
	  } else if (c2 == true) {
		  document.getElementById('multicheck').indeterminate = true;
		  return false;
	  }
	  return false;
  };
  
  $scope.hasSelected = function() {
	  var b = false;
	  $scope.learn.forEach(function(val) {
	    b = b || val;
	  });
	  return b;
  };
  
  $scope.selfPlay = function() {
	  $http.post('botgame', {'botId1': Number($scope.bot1), 'botId2': Number($scope.bot2), 'count': $scope.gameCount}).
	      success(function(data, status) {
	    	  $scope.showMessage('self play data sent');
	      });
  }
  
}]);