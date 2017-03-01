var app = angular.module('bduApp', [
	'ngRoute', 
	'ngResource', 
	'ngDialog', 
	'ngFileUpload', 
	'ngImgCrop'
	])
.run(function($http, $rootScope, UserService, TournamentService) {
	
	$rootScope.authenticated = false;
	$rootScope.istVorstand = false;
	$rootScope.user = null;

	$http.get('/sendUser')
	.then(function (user) {
		if (user.status != 204) {
			$rootScope.authenticated = true;
			$rootScope.istVorstand = (user.data.position == 1);
			$rootScope.user = user.data;
		}
	}, function errorCallback(err) {
		alert(err);
	});


	$rootScope.signout = function(){
		$http.get('/logout');
		$rootScope.user = null;
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

//RESOURCE SERVICE FACTORIES
// app.factory('UserService', function ($resource) {
//     return $resource('/app/user/:id');
// });

app.factory('UserService', function ($resource) {
    return $resource('/app/user/:id', { id: 'id' }, {
        update: {
            method: 'PUT' // this method issues a PUT request
        }
    });
});

app.factory('TournamentService', function ($resource) {
    return $resource('/app/tournament/:id');
});

app.controller('mainCtrl', function ($scope, $http, $rootScope, $location, ngDialog, UserService, TournamentService) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {
        //if user is logged in then the user can see the profile page

        //get the logged in user
		var user = UserService.get({ id: $rootScope.user.id }, function() {
			$scope.user = user;
		});

		$scope.update = false;
		$scope.SuccessMessage = '';
		$scope.ErrorMessage = '';

		$scope.updateUser = function () {
			var parameters = JSON.stringify({
				email: $scope.user.email,
				name: $scope.user.name,
				vorname: $scope.user.vorname,
				gender: $scope.user.gender,
				food: $scope.user.food
			});
            UserService.update({ id: $rootScope.user.id }, parameters, function (result) {
				if (!result.error) {
					$scope.SuccessMessage = result.message;
                    var x = document.getElementById("snackbarSuccess");
                    x.className = "show";
                    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);
                    $scope.update = false;
                }
				else {
                    $scope.ErrorMessage = result.message;
                    var x = document.getElementById("snackbarError");
                    x.className = "show";
                    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);
                    $scope.update = false;
                }
            });
		};

		//SHOW TOURNAMENT DETAILS DIALOG
		$scope.openDetails = function (tournament) {
			$scope.tournament = tournament;
            ngDialog.open({
                template: 'profileTournamentDialog.html',
                controller: 'mainCtrl',
                scope: $scope
            });
        };

		$scope.close = function () {
            $scope.closeThisDialog();
        };
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
		};

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
			$scope.isReged = (_.find($scope.tournament.users, {'id': $scope.user.id}));
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
			$scope.isSpeaker = ($scope.selected.id == 2);
			$scope.role = $scope.selected.value;
		};

		$scope.team = '';

		$scope.FormData={accountNum: ''};
		$scope.ShowNgDialog = function () {
			ngDialog.open({
				template: 'tournamentsDialog.html',
				controller: 'TournamentCtrl',
				scope: $scope
			});
		};

		//REG FUNCION TO BE CLICKED FROM THE DIALOG
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
		};

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
		};

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

app.controller('OverviewCtrl', function($scope, $http, $rootScope, $window, $location, ngDialog, anchorSmoothScroll) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

		//UEBERSICHT ANMELDUNGEN

		//get all Tournaments and their Users
		$http.get('/app/getAllTournamentsUsers')
		.then(function successCallback(collection) {
			$scope.tournamentsusers = _.orderBy(collection.data, ['startdate'], 'asc');
		});
		var tournamentDir = 'asc';
		$scope.sortTournaments = function(key){
			$scope.tournamentsusers = _.orderBy($scope.tournamentsusers, [key], tournamentDir);
            tournamentDir = (tournamentDir == 'asc') ? 'desc' : 'asc';
		};

		var userDir = 'asc';
		$scope.sortUsers = function(key){
            $scope.tournament.users = _.orderBy($scope.tournament.users, [key], userDir);
			userDir = (userDir == 'asc') ? 'desc' : 'asc';
		};

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
                        $scope.tournamentsusers = _.orderBy(collection.data, ['startdate'], 'asc');
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
                            $scope.tournamentsusers = _.orderBy(collection.data, ['startdate'], 'asc');
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
			$scope.tournament = tournament;
			$scope.showUsers = true;

			//scroll if mobile
			anchorSmoothScroll.scrollTo('users');
		};

		//OPEN IMAGE DIALOG
        $scope.ShowImageDialog = function (userID) {
        	console.log(userID)
            $http.get('/app/user/' + userID)
                .then(function successCallback(user) {
                    $scope.imageUser = user.data;
                });
            ngDialog.open({
                template: 'showImageDialog.html',
                controller: 'OverviewCtrl',
                scope: $scope
            });
        };

        $scope.close = function () {
            $scope.closeThisDialog();
        };

	}
});

app.controller('ResetCtrl', function($scope, $http, $location) {

	$scope.email = '';

	$scope.message = '';

	$scope.submit = function(){
		$http.post('/forgot', {email: $scope.email})
		.then(function successCallback(response) {
			$scope.message = 'An E-Mail has been sent to you with further instructions. Since we are financing this project by advertising penis enlargement instruments you should ALSO CHECK YOUR SPAM FOLDER.';
		}, function errorCallback(err) {
			$scope.message = err;
		});
	};
});

app.controller('authCtrl', function($scope, $http, $rootScope, $location){
	$scope.loginuser = {
		email: '',
		password: ''
	};

	$scope.reguser = {
		email: '',
		password: '',
		name: '',
		vorname: '',
		gender: ''
	};
	$scope.error_message = '';

	$scope.login = function(){
		$http.post('/login', $scope.loginuser).success(function(data){
			if(data.state == 'success'){
				$rootScope.authenticated = true;
				$rootScope.user = data.user;
				$rootScope.istVorstand = (data.user.position == 1);
				$location.path('/profile');
			}
			else{
				$scope.error_message = data.message;
			}
		});
	};

	$scope.register = function(){
		if ($scope.match) {
			$http.post('/signup', $scope.reguser).success(function(data){
				if(data.state == 'success'){
					$rootScope.authenticated = true;
					$rootScope.user = data.user;
					$rootScope.istVorstand = (data.user.position == 1);
					$location.path('/profile');
				}
				else{
					$scope.error_message = data.message;
				}
			});
		} else {
			$scope.error_message = 'Passwords do not match.';
		}
			
	};

	//CHECK FOR PW MATCH
	$scope.match = false;
	$scope.confirmFill = false;
	$scope.pwd2 = '';

	$scope.checkMatch = function() {
		if(($scope.reguser.password == $scope.pwd2) && $scope.confirmFill) $scope.match = true;
		else $scope.match = false;
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