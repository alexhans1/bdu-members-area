var app = angular.module('bduApp', [
	'ngRoute', 
	'ngResource', 
	'ngDialog', 
	'ngFileUpload', 
	'ngImgCrop'
])
.run(function($http, $rootScope, $location) {
	
	$rootScope.authenticated = false;
	$rootScope.user = null;
	$rootScope.imgURL = null;

	$http.get('/sendUser')
	.then(function (user) {
		if (user.status != 204) {
			$rootScope.authenticated = true;
			$rootScope.istVorstand = (user.data.role == 1) ? true : false;
			$rootScope.user = user.data;
			$rootScope.imgURL = '/images/userPics/' + user.data.image;
		}
	}, function errorCallback(err) {
		alert(err);
	})


	$rootScope.signout = function(){
		$http.get('/logout');
		$rootScope.user = null;
		$rootScope.imgURL = null;
		$rootScope.authenticated = false;
		$rootScope.istVorstand = false;
	};
});

//durch die config wird definiert welche URIs welche controller verwenden
app.config(function($routeProvider){
	$routeProvider
	//the login display
	.when('/', {
		templateUrl: 'login.html',
		controller: 'authCtrl'
	})
	//the signup display
	.when('/signup', {
		templateUrl: 'signup.html',
		controller: 'authCtrl'
	})
	//the profile display
	.when('/profile', {
		templateUrl: 'profile.html',
		controller: 'mainCtrl'
	})
	//the tournaments display
	.when('/tournaments', {
		templateUrl: 'tournaments.html',
		controller: 'TournamentCtrl'
	})
	//the tournaments display
	.when('/editTournament', {
		templateUrl: 'editTournament.html',
		controller: 'TournamentCtrl'
	})
	//the tournaments display
	.when('/imageUpload', {
		templateUrl: 'imageUpload.html',
		controller: 'UploadCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
});

app.controller('mainCtrl', function ($scope, $http, $rootScope, $location) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

		//if user is logged in then the user can see the profile page
		$http.get('/app/getUserTournaments')
		.then(function successCallback(res) {
			$scope.myTournaments = res.data;
		});

		$scope.update = false;
		$scopeSuccessMessage = '';
		$scopeErrorMessage = '';

		$scope.email = $rootScope.user.email;
		$scope.name = $rootScope.user.name;
		$scope.vorname = $rootScope.user.vorname;
		$scope.gender = $rootScope.user.gender;
		$scope.food = $rootScope.user.food;

		$scope.updateUser = function () {
			var parameters = JSON.stringify({
				email: $scope.email,
				name: $scope.name,
				vorname: $scope.vorname,
				gender: $scope.gender,
				food: $scope.food
			});
			$http.put('/app/user/' + $rootScope.user.id, parameters)
			.then(function successCallback() {
				$scope.SuccessMessage = 'Update successful.';
				$scope.update = false;
			}, function errorCallback(err) {
				$scope.ErrorMessage = 'Error while updating.';
				$scope.update = false;
			});
		}
	}
});

app.controller('TournamentCtrl', function($scope, $http, $rootScope, $location, ngDialog) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

		$http.get('/app/tournament')
		.then(function successCallback(tournaments) {
			$scope.tournaments = tournaments.data;
		});

		$scope.setTournament = function(id) {
			$scope.tournament = _.find($scope.tournaments, {id: id});
			$scope.showDetails = true;
			$scope.teams = [];
			$http.get('app/teamnames/' + id)
			.then(function successCallback(col) {
				for (var i = 0; i < col.data.length; i++) {
					if (($scope.teams.indexOf(col.data[i].teamname) === -1) && (col.data[i].teamname != null)) {
						$scope.teams.push(col.data[i].teamname);
					}
				}
			}, function errorCallback(err) {
				console.log(err);
			});
		};

		$scope.roles = [{
			id: 1,
			value: 'judge',
			label: 'judge'
		}, {
			id: 2,
			value: 'speaker',
			label: 'speaker'
		}, {
			id: 3,
			value: 'independent',
			label: 'independent'
		}];

		$scope.selected = $scope.roles[0];

		$scope.isSpeaker = false;
		$scope.role;
		$scope.setRole = function () {
			$scope.isSpeaker = ($scope.selected.id == 2) ? true : false;
			$scope.role = $scope.selected.value;
		};

		$scope.team = '';

		$scope.FormData={accountNum: ''};
		$scope.ShowNgDialog = function () {
			ngDialog.open({ 
				template: 'tournamentsDialog.html',
				controller: 'TournamentCtrl',
				scope: $scope,
				width: '40%'
			});
		}

		$scope.reg = function() {

			var url = '/app/reg/' + $scope.tournament.id;
			var parameters = JSON.stringify({role: $scope.role, team: $scope.team});
			$http.post(url, parameters)
			.then(function successCallback(response) {
				if (response.status == 200) {
					confirm('Successfully registered.');
				} else {
					confirm(response.data);
				}
				$scope.closeThisDialog();
			}, function errorCallback(response) {
				confirm(response.data);
				$scope.closeThisDialog();
			});
		}
	}
});

app.controller('authCtrl', function($scope, $http, $rootScope, $location){
	$scope.user = {email: '', password: ''};
	$scope.error_message = '';

	$scope.login = function(){
		$http.post('/login', $scope.user).success(function(data){
			if(data.state == 'success'){
				$rootScope.authenticated = true;
				$rootScope.user = data.user;
				$rootScope.imgURL = '/images/userPics/' + data.user.image;
				$rootScope.istVorstand = (data.user.role == 1) ? true : false;
				$location.path('/profile');
			}
			else{
				$scope.error_message = data.message;
			}
		});
	};

	$scope.register = function(){
		$http.post('/signup', $scope.user).success(function(data){
			if(data.state == 'success'){
				$rootScope.authenticated = true;
				$rootScope.user = data.user;
				$rootScope.imgURL = '/images/userPics/' + data.user.image;
				$rootScope.istVorstand = (data.user.role == 1) ? true : false;
				$location.path('/profile');
			}
			else{
				$scope.error_message = data.message;
			}
		});
	};
});

// FILE UPLOADER

app.controller('UploadCtrl', ['$scope', 'Upload', '$timeout', '$http', '$rootScope', '$location',
	function ($scope, Upload, $timeout, $http, $rootScope, $location) {

	$scope.submit = false;

	$scope.upload = function (dataUrl, name) {
		Upload.upload({
			url: '/app/user/image',
			data: {
				pic: Upload.dataUrltoBlob(dataUrl, name)
			},
		}).then(function (response) {
			$timeout(function () {
				$scope.result = response.data;
			});
		}, function (response) {
			if (response.status > 0) $scope.errorMsg = response.status 
				+ ': ' + response.data;
		}, function (evt) {
			$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
		});

		$rootScope.signout();
		$location.path('/#');
	}
}]);