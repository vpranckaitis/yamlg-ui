var myApp = angular.module('yamlg', ['ngCookies']);
myApp.controller('yamlg-controller', ['$scope', '$http', '$cookies', function ($scope, $http, $cookies) {
  'use strict'
	
  window.d = $scope;
  
  var boardWidth = 8;
  var boardHeight = 8;
  var boardSize = boardWidth * boardHeight;
  $scope.selectedChecker = boardSize;
  $scope.playerFirst = "true";
  $scope.gameId = -1;
  $scope.board = '';
  
  $scope.availableMoves = new Array();
  
  $scope.loggedIn = false;
  $scope.email = "";
  $scope.session = $cookies['session'];
  
  $scope.statistics = undefined;
  
  $scope.difficulty = '';
  $scope.difficulties = [];
  
  console.log('session: ' + $scope.session);
  
  for (var i = 0; i < boardSize + 1; i++) {
	  $scope.availableMoves[i] = new Array();
  }
	
  $scope.range = function(min, max, step){
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
  };
  
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
	  
	  $http.post('games/' + $scope.gameId + '/moves', {board: $scope.board}).
	      success(function(data, status) {
	              $scope.board = data.board;
	              $scope.availableMoves = data.moves;
	              $scope.availableMoves[boardSize] = new Array();
	              if (data.finished == 1) {
	            	  alert("CPU wins");
	              } else if (data.finished == 2) {
	            	  alert("You win");
	              }
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
  
  var parseBoard = function(data) {
	  $scope.board = data.board;
 	  $scope.gameId = data.gameId;
 	  $scope.availableMoves = data.moves;
 	  $scope.availableMoves[boardSize] = new Array(); 
  };
  
  var parseSession = function(data) {
	  console.log('parse session');
	  $scope.email = data.email;
      $scope.session = data.session;
      $cookies['session'] = data.session;
      $scope.loggedIn = true;
      if (typeof data.game != 'undefined') {
    	  parseBoard(data.game);
      }
  };
  
  $scope.startGame = function() {
	  $http.post('games', {playerFirst: JSON.parse($scope.playerFirst), difficulty: Number($scope.difficulty), sessionId: $scope.session}).
	      success(function(data, status) {
	    	 parseBoard(data)
	      });
  };
  
  $scope.getDifficulties = function() {
	  $http.get('games/difficulties').success(function(data, status) {
	      $scope.difficulties = data;
	  });
  }
  
  $scope.getStatistics = function() {
	  $http.get('statistics/' + $scope.session).
	      success(function(data, status) {
	    	 $scope.statistics = data;
	      });
  };
  
  $scope.logout = function() {
	  $scope.loggedIn = false;
	  $scope.board = '';
	  $scope.availableMoves = $scope.availableMoves.map(function() { return new Array() });
	  $scope.selectedChecker = boardSize;
	  $scope.email = undefined;
	  $scope.session = undefined;
	  $cookies['session'] = undefined;
  };
  
  window.restoreSession = function() {
	  if (typeof $scope.session != 'undefined') {
		  $http.get('login/' + $scope.session).
		      success(function(data, status) {
		    	 parseSession(data);
		      });
	  }
  }
  
  window.signinCallback = function(authResult) {
	  if (authResult['status']['signed_in']) {
	    // Update the app to reflect a signed in user
	    // Hide the sign-in button now that the user is authorized, for example:
		console.log(authResult);
		$http.post('login', {'accessToken': authResult.access_token }).
		    success(function(data, status) {
		    		parseSession(data);
		      	});
	  } else {
	    // Update the app to reflect a signed out user
	    // Possible error values:
	    //   "user_signed_out" - User is signed-out
	    //   "access_denied" - User denied access to your app
	    //   "immediate_failed" - Could not automatically log in the user
	    console.log('Sign-in state: ' + authResult['error']);
	  }
	}
  
  window.onbeforeunload = function(e){
	  gapi.auth.signOut();
	};
}]);