var app = angular.module('bduApp', [
	'ngRoute', 
	'ngResource', 
	'ngDialog', 
	'ngFileUpload', 
	'ngImgCrop'
	])
.run(function($http, $rootScope, $location) {
	
	$rootScope.authenticated = false;
	$rootScope.istVorstand = false;
	$rootScope.user = null;
	$rootScope.imgURL = null;

	$http.get('/sendUser')
	.then(function (user) {
		if (user.status != 204) {
			$rootScope.authenticated = true;
			$rootScope.istVorstand = (user.data.position == 1) ? true : false;
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
	//the forgot password display
	.when('/forgot', {
		templateUrl: 'forgot.html',
		controller: 'ResetCtrl'
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
	//the vorstand display
	.when('/vorstand', {
		templateUrl: 'vorstand.html',
		controller: 'VorstandCrtl'
	})
	//the reg overview display
	.when('/anmeldungen', {
		templateUrl: 'anmeldungen.html',
		controller: 'OverviewCtrl'
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

app.controller('TournamentCtrl', function($scope, $http, $rootScope, $location, $window, ngDialog, anchorSmoothScroll) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

		//get all Tournaments
		var getAllTournaments = function () {
			$http.get('/app/getAllTournamentsUsers')
			.then(function successCallback(tournaments) {
				$scope.alltournaments = _.orderBy(tournaments.data, ['startdate'], 'asc');
				$scope.tournaments = $scope.alltournaments;
			});
		}

		getAllTournaments();

		$scope.setTournament = function(id, scroll) {

			//scroll if mobile
			if(scroll) {
				anchorSmoothScroll.scrollTo('details');
			}
			
			getAllTournaments();
			$scope.tournament = _.find($scope.alltournaments, {id: id});
			$scope.showDetails = true;
			//load teamnames for this tournament
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

			//check if user is registered for this tournament
			$scope.isReged = (!_.find($scope.tournament.users, {'id': $scope.user.id})) ? false : true;
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
		$scope.role = 'judge';
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
		};

		//DELETE TOURNAMENT FUNCTION
		$scope.delete = function () {
			var deleteTournament = $window.confirm('Are you absolutely sure you want to delete the tournament?');
			if (deleteTournament) {
				$http.delete('/app/tournament/' + $scope.tournament.id)
				.then(function successCallback(response) {
					if (!response.error) {
						$scope.SuccessMessage = response.data.message;
						//TODO update Tournaments resource
						//for now:
						getAllTournaments();
					} else {
						$scope.ErrorMessage = response.data.message;
					}
				}, function errorCallback(err) {
					$scope.ErrorMessage = err.data.message;
				});
			}
		};

		//UPDATE TOURNAMENT FUNCTION
		$scope.showUpdate = false;

		$scope.submitUpdate = function () {
			$http.put('/app/tournament/' + $scope.tournament.id, $scope.tournament)
			.then(function successCallback(res) {
				$scope.SuccessMessage = res.data.data.message;
				$scope.showUpdate = false;
			}, function errorCallback(err) {
				$scope.ErrorMessage = res.data.data.message;	
			});
		}

		//TOGGLE THROUGH LANGUAGES
		$scope.toggleVal = 'all';
		$scope.toggle = function () {
			if ($scope.toggleVal == 'en') {
				$scope.tournaments = _.filter($scope.alltournaments, {language: 'other'});
				$scope.toggleVal = 'other';
			} else if ($scope.toggleVal == 'de') {
				$scope.tournaments = _.filter($scope.alltournaments, {language: 'en'});
				$scope.toggleVal = 'en';
			} else if ($scope.toggleVal == 'other') {
				$scope.tournaments = $scope.alltournaments;
				$scope.toggleVal = 'all';
			} else {
				$scope.tournaments = _.filter($scope.alltournaments, {language: 'de'});
				$scope.toggleVal = 'de';
			}
		}

		//DELETE REGISTRATION
		$scope.unreg = function(t_id, u_id){
			var deleteReg = $window.confirm('Are you absolutely sure you want to delete this registration?');
			if (deleteReg) {
				var parameters = JSON.stringify({
					t_id: t_id,
					u_id: u_id
				});
				$http({
					url: 'app/deleteReg',
					method: 'DELETE',
					data: {
						t_id: t_id,
						u_id: u_id
					},
					headers: {
						"Content-Type": "application/json;charset=utf-8"
					}
				})
				.then(function successCallback(response) {
					if (!response.error) {
						getAllTournaments();
						$scope.isReged = false;
						$scope.SuccessMessage = response.message;
					} else {
						$scope.ErrorMessage = response.data.message;
					}
				}, function errorCallback(err) {
					$scope.ErrorMessage = err.data;
				});
			}
		};
	}
});

app.controller('VorstandCrtl', function($scope, $http, $rootScope) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

		$scope.newTournament = {
			name: '',
			ort: '',
			startdate: new Date(),
			enddate:  new Date(),
			deadline:  new Date(),
			format: '',
			league: '',
			accommodation: '',
			speakerprice: '',
			judgeprice: '',
			rankingvalue: '',
			link: '',
			teamspots: '',
			judgespots: '',
			comments: '',
			language: ''
		};

		$scope.SuccessMessage = '';
		$scope.ErrorMessage = '';

		$scope.submit = function () {
			if ($scope.newTournament.name == '' || $scope.newTournament.language == '') {
				$scope.ErrorMessage = 'Name und Sprache müssen gesetzt werden.';
			} else {
				$http.post('/app/tournament', $scope.newTournament)
				.then(function successCallback(response) {
					if (!response.error) {
						$scope.ErrorMessage = '';
						$scope.SuccessMessage = 'Neues Turnier erstellt.';
						//TODO update Tournaments resource
					} else {
						$scope.ErrorMessage = response.data.message;
					}
				}, function errorCallback(err) {
					confirm(err.data);
				});
			}
		};
	}
});

app.controller('OverviewCtrl', function($scope, $http, $rootScope, $window, anchorSmoothScroll) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

		//UEBERSICHT ANMELDUNGEN

		//get all Users and their Tournaments
		$http.get('/app/getAllTournamentsUsers')
		.then(function successCallback(collection) {
			$scope.tournamentsusers = _.orderBy(collection.data, ['startdate'], 'asc');
		});
		$scope.dir = 'asc';
		$scope.sort = function(key, dir){
			$scope.tournamentsusers = _.orderBy($scope.tournamentsusers, [key], $scope.dir);
			$scope.dir = ($scope.dir == 'asc') ? 'desc' : 'asc';
		}

		$scope.detailedTournament = '';

		$scope.open = function (user_id) {
			if (user_id == $scope.detailedTournament){
				$scope.detailedTournament = '';
				$scope.showUsers = false;
			}
			else $scope.detailedTournament = user_id;
		};

		//SET ATTENDED TO 1
		$scope.went = function(t_id, u_id){
			var parameters = JSON.stringify({
				t_id: t_id,
				u_id: u_id
			});
			$http.put('/app/setAttended', parameters)
			.then(function successCallback(response) {
				if (!response.error) {
					$http.get('/app/getAllTournamentsUsers')
					.then(function successCallback(collection) {
						$scope.tournamentsusers = collection.data;
					});
				} else {
					confirm(response.data.message);
				}
			}, function errorCallback(err) {
				confirm(err.data);
			});
		};

		//DELETE REGISTRATION
		$scope.delete = function(t_id, u_id){
			var deleteReg = $window.confirm('Are you absolutely sure you want to delete this registration?');
			if (deleteReg) {
				var parameters = JSON.stringify({
					t_id: t_id,
					u_id: u_id
				});
				$http({
					url: 'app/deleteReg',
					method: 'DELETE',
					data: {
						t_id: t_id,
						u_id: u_id
					},
					headers: {
						"Content-Type": "application/json;charset=utf-8"
					}
				})
				.then(function successCallback(response) {
					if (!response.error) {
						$http.get('/app/getAllTournamentsUsers')
						.then(function successCallback(collection) {
							$scope.tournamentsusers = collection.data;
						});
					} else {
						confirm(response.data.message);
					}
				}, function errorCallback(err) {
					confirm(err.data);
				});
			}
		};

		//FOR MOBILE VIEW
		$scope.showUsers = false;
		
		$scope.goToUsers = function (tournament) {
			$scope.overview_users = tournament.users;
			$scope.showUsers = true;

			//scroll if mobile
			anchorSmoothScroll.scrollTo('users');
		};

	}
});

app.controller('ResetCtrl', function($scope, $http, $location) {

	$scope.email = '';

	$scope.message = '';

	$scope.submit = function(){
		$http.post('/forgot', {email: $scope.email})
		.then(function successCallback(response) {
			$scope.message = res.data;
		}, function errorCallback(err) {
			$scope.message = err;
		});
	};
});

app.controller('authCtrl', function($scope, $http, $rootScope, $location){
	$scope.user = {
		email: '',
		password: ''
	};
	$scope.error_message = '';

	$scope.login = function(){
		$http.post('/login', $scope.user).success(function(data){
			if(data.state == 'success'){
				$rootScope.authenticated = true;
				$rootScope.user = data.user;
				$rootScope.imgURL = '/images/userPics/' + data.user.image;
				$rootScope.istVorstand = (data.user.position == 1) ? true : false;
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
				$rootScope.istVorstand = (data.user.position == 1) ? true : false;
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

//NG-SCROLL

app.service('anchorSmoothScroll', function(){

	this.scrollTo = function(eID) {

	// This scrolling function 
	// is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

		var startY = currentYPosition();
		var stopY = elmYPosition(eID);
		var distance = stopY > startY ? stopY - startY : startY - stopY;
		if (distance < 100) {
			scrollTo(0, stopY); return;
		}
		var speed = Math.round(distance / 100);
		if (speed >= 20) speed = 20;
		var step = Math.round(distance / 25);
		var leapY = stopY > startY ? startY + step : startY - step;
		var timer = 0;
		if (stopY > startY) {
			for ( var i=startY; i<stopY; i+=step ) {
				setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
				leapY += step; if (leapY > stopY) leapY = stopY; timer++;
			} return;
		}
		for ( var i=startY; i>stopY; i-=step ) {
			setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
			leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
		}

		function currentYPosition() {
		// Firefox, Chrome, Opera, Safari
		if (self.pageYOffset) return self.pageYOffset;
		// Internet Explorer 6 - standards mode
		if (document.documentElement && document.documentElement.scrollTop)
			return document.documentElement.scrollTop;
		// Internet Explorer 6, 7 and 8
		if (document.body.scrollTop) return document.body.scrollTop;
		return 0;
		}

		function elmYPosition(eID) {
			var elm = document.getElementById(eID);
			var y = elm.offsetTop;
			var node = elm;
			while (node.offsetParent && node.offsetParent != document.body) {
				node = node.offsetParent;
				y += node.offsetTop;
			} return y;
		}

	};

});