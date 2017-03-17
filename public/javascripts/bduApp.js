var app = angular.module('bduApp', [
	'ngRoute', 
	'ngResource', 
	'ngDialog', 
	'ngFileUpload', 
	'ngImgCrop'
	])
.run(function($http, $rootScope) {


    $rootScope.personnelDebt = 0;
	
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
	//the reg overview display
	.when('/finances', {
		templateUrl: 'finances.html',
		controller: 'FinanceCtrl'
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
	//the bug report display
	.when('/bugReport', {
		templateUrl: 'bugReport.html',
		// templateUrl: 'test.html',
		controller: 'bugCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
});

//RESOURCE SERVICE FACTORIES

app.factory('UserService', function ($resource) {
    return $resource('/app/user/:id', {}, {
        update: {
            method: 'PUT' // this method issues a PUT request
        }
    });
});

app.factory('TournamentService', function ($resource) {
    return $resource('/app/tournament/:id', {}, {
        update: {
            method: 'PUT' // this method issues a PUT request
        }
    });
});

app.factory('BugReportService', function ($resource) {
    return $resource('/bugs/:id', {}, {
        update: {
            method: 'PUT' // this method issues a PUT request
        }
    });
});

app.controller('mainCtrl', function ($scope, $http, $rootScope, $location, ngDialog, UserService) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {
        //if user is logged in then the user can see the profile page

        //get the logged in user
		var user = UserService.get({ id: $rootScope.user.id }, function() {
			$scope.debt = _.sumBy(user.tournaments, function(ts) { return (ts.pivot_price_paid - ts.pivot_price_owed) });
			$rootScope.personnelDebt = $scope.debt;
			$scope.user = user;
			$scope.user.tournaments = _.orderBy($scope.user.tournaments, ['startdate'], 'desc');
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
                    showSnackbar(true, result.message);
                    $scope.update = false;
                }
				else {
					showSnackbar(false, result.message);
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

app.controller('TournamentCtrl', function($scope, $http, $rootScope, $location, $window, ngDialog, anchorSmoothScroll, TournamentService) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

        //get all Tournaments and their Users
        var getAllTournaments = function () {
            var tournaments = TournamentService.query(function() {
                $scope.tournaments = _.orderBy(tournaments, ['startdate'], 'desc');
                $scope.allTournaments = tournaments;
            });
        };
        getAllTournaments();

		$scope.setTournament = function(id) {
			getAllTournaments();

			$scope.tournament = _.find($scope.allTournaments, {id: id});
			$scope.showDetails = true;

			//check if user is registered for this tournament
			$scope.isReged = (_.find($scope.tournament.users, {'id': $rootScope.user.id}));

			anchorSmoothScroll.scrollTo('details');
		};

		// NG-DIALOG FOR REGISTRATION

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
        $scope.team = '';
        $scope.comment = '';

		$scope.isSpeaker = false;
		$scope.setRole = function () {
			$scope.isSpeaker = ($scope.selected.id == 2);
		};


		$scope.FormData={accountNum: ''};
		$scope.ShowNgDialog = function () {
			ngDialog.open({
				template: 'tournamentsDialog.html',
				controller: 'TournamentCtrl',
				scope: $scope
			});
		};

		//REG FUNCTION TO BE CLICKED FROM THE DIALOG
		$scope.reg = function() {

			var url = '/app/reg/' + $scope.tournament.id;
			var parameters = JSON.stringify({
				role: $scope.selected.value,
				team: $scope.team,
				comment: $scope.comment
			});
			$http.post(url, parameters)
			.then(function successCallback(response) {
                $scope.closeThisDialog();
				if (response.status == 200) {
                    showSnackbar(true, 'Successfully registered.');
					$scope.isReged = true; //TODO this does not currently work because ng-dialog hinders view update
				} else {
                    showSnackbar(false, response.data);
				}
			}, function errorCallback(response) {
                showSnackbar(false, response.data);
				$scope.closeThisDialog();
			});
		};

		//DELETE TOURNAMENT FUNCTION
		$scope.delete = function () {
			var deleteTournament = $window.confirm('Are you absolutely sure you want to delete this tournament?');
			if (deleteTournament) {
				TournamentService.delete({id: $scope.tournament.id}, function (res) {
					if (!res.error) {
                        getAllTournaments();
                        $scope.showDetails = false;
                        showSnackbar(true, res.message);
                    } else {
						showSnackbar(false, res.message);
					}
                });
			}
		};

		//UPDATE TOURNAMENT FUNCTION
		$scope.showUpdate = false;

		$scope.submitUpdate = function () {
			var tmpID = $scope.tournament.id;
            TournamentService.update({ id: $scope.tournament.id }, $scope.tournament, function (result) {
                if (!result.error) {
                    getAllTournaments();
                    showSnackbar(true, result.message);
                    $scope.showUpdate = false;
                }
                else {
                    showSnackbar(false, result.message);
                }
            });
            $scope.showDetails = false;
		};

		//TOGGLE THROUGH LANGUAGES
		$scope.toggleVal = 'all';
		$scope.toggle = function () {
			if ($scope.toggleVal == 'en') {
				$scope.tournaments = _.filter($scope.allTournaments, {language: 'other'});
				$scope.toggleVal = 'other';
			} else if ($scope.toggleVal == 'de') {
				$scope.tournaments = _.filter($scope.allTournaments, {language: 'en'});
				$scope.toggleVal = 'en';
			} else if ($scope.toggleVal == 'other') {
				$scope.tournaments = $scope.allTournaments;
				$scope.toggleVal = 'all';
			} else {
				$scope.tournaments = _.filter($scope.allTournaments, {language: 'de'});
				$scope.toggleVal = 'de';
			}
		};

		//DELETE REGISTRATION
		$scope.unreg = function(t_id, u_id){
			var deleteReg = $window.confirm('Are you absolutely sure you want to delete this registration?');
			if (deleteReg) {
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
				.then(function successCallback(res) {
					if (!res.error) {
						getAllTournaments();
						$scope.isReged = false;
						showSnackbar(true, res.data.message);
					} else {
						showSnackbar(false, 'Error while removing your registration.');
					}
				}, function errorCallback(err) {
					$scope.ErrorMessage = err.data;
				});
			}
		};
	}
});

app.controller('OverviewCtrl', function($scope, $http, $rootScope, $window, $location, ngDialog, anchorSmoothScroll, TournamentService) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

		//UEBERSICHT ANMELDUNGEN

		//get all Tournaments and their Users
		var getAllTournaments = function () {
            var tournaments = TournamentService.query(function() {
                $scope.tournamentsusers = _.orderBy(tournaments, ['startdate'], 'asc');
            });
        };
		getAllTournaments();

		// function to sort tournaments by key
		var tournamentDir = 'asc';
		$scope.sortTournaments = function(key){
			$scope.tournamentsusers = _.orderBy($scope.tournamentsusers, [key], tournamentDir);
            tournamentDir = (tournamentDir == 'asc') ? 'desc' : 'asc';
		};

        // function to sort users by key
		var userDir = 'asc';
		$scope.sortUsers = function(key){
            $scope.tournament.users = _.orderBy($scope.tournament.users, [key], userDir);
			userDir = (userDir == 'asc') ? 'desc' : 'asc';
		};

		//SET ATTENDED TO 1
		$scope.went = function(t_id, u_id, role){
			var parameters = JSON.stringify({
				t_id: t_id,
				u_id: u_id,
				role: role
			});
			$http.put('/app/setAttended', parameters)
			.then(function successCallback(response) {
				if (!response.error) {
					getAllTournaments();
                    $scope.tournament = _.find($scope.tournamentsusers, { id: $scope.tournament.id });
                    showSnackbar(true, response.data.data.message);
				} else {
					showSnackbar(false, response.data.message);
				}
			}, function errorCallback(err) {
				confirm(err.data);
			});
		};

		//DELETE REGISTRATION
		$scope.delete = function(t_id, u_id){
			var deleteReg = $window.confirm('Are you absolutely sure you want to delete this registration?');
			if (deleteReg) {
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
					response = response.data;
					if (!response.error) {
						showSnackbar(true, response.message);
                        getAllTournaments();
                        console.log($scope.tournamentsusers);
                        $scope.tournament = _.find($scope.tournamentsusers, { id: $scope.tournament.id });
					} else {
						showSnackbar(false, response.message);
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
        $scope.ShowImageDialog = function (Vorname, URL) {
            // var user = UserService.get({ id: userID }, function() {
            //     $scope.imageUser = user;
            // });
            $scope.imgDialogVorname = Vorname;
            $scope.imgDialogURL = URL;
            // $http.get('/app/user/' + userID)
            //     .then(function successCallback(user) {
            //         $scope.imageUser = user.data;
            //     });
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

app.controller('VorstandCrtl', function($scope, $http, $rootScope, TournamentService, UserService) {

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

        $scope.submit = function () {
            if ($scope.newTournament.name == '' || $scope.newTournament.language == '') {
                showSnackbar(false, 'Name und Sprache müssen gesetzt werden.');
            } else {
                TournamentService.save($scope.newTournament, function (res) {
                    if (!res.error) {
                        showSnackbar(true, res.message);
                    } else {
                        showSnackbar(false, 'Error while adding new Tournament.');
                    }
                });
            }
        };

    }
});

app.controller('FinanceCtrl', function($scope, $http, $rootScope, $location, anchorSmoothScroll, UserService) {

	if(!$rootScope.authenticated) {
		$location.path('/');
	} else {

		//UEBERSICHT Finanzen

        //get all Users and their Tournaments
        var getAllUsers = function () {
            var users = UserService.query(function() {
                $scope.users = _.orderBy(users, ['vorname'], 'asc');
            });
        };
        getAllUsers();

		// function to sort users by key
		var userDir = 'asc';
		$scope.sortUsers = function(key){
			$scope.users = _.orderBy($scope.users, [key], userDir);
            userDir = (userDir == 'asc') ? 'desc' : 'asc';
		};

        // function to sort tournaments by key
		var tournamentDir = 'asc';
		$scope.sortTournaments = function(key){
            $scope.user.tournaments = _.orderBy($scope.user.tournaments, [key], tournamentDir);
            tournamentDir = (tournamentDir == 'asc') ? 'desc' : 'asc';
		};

		$scope.showTournaments = false;

		$scope.goToTournaments = function (user) {
			$scope.user = user;
			$scope.showTournaments = true;

			anchorSmoothScroll.scrollTo('tournaments');
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

app.controller('bugCtrl', function($scope, $http, $window, BugReportService){
	$scope.newBug = {
		description: '',
		type: ''
	};

	var allBugs;
	var getAllBugs = function () {
        $http.get('/bugs').success(function(bugs){
        	allBugs = bugs.data;
            $scope.bugs = _.orderBy(bugs.data, ['created_at'], 'desc');
        });
    };
	getAllBugs();

	var filter = true;
	$scope.filterBugs = function () {
		console.log(filter);
		if(filter) $scope.bugs = _.filter($scope.bugs,{'status' : 0});
		else $scope.bugs = _.orderBy(allBugs, ['created_at'], 'desc');
        filter = !filter;
    };

    $scope.reportBug = function () {
        if ($scope.newBug.description == '' || $scope.newBug.type == '') {
            showSnackbar(false, 'Please choose a type and describe the problem.');
        } else if ($scope.newBug.description.length > 1500) {
            showSnackbar(false, 'Keep your description below 1500 letters');
		} else {
            BugReportService.save($scope.newBug, function (res) {
                if (!res.error) {
                    getAllBugs();
                    showSnackbar(true, res.message);
                    $scope.newBug.description = '';
                    $scope.newBug.type = '';
                } else {
                    showSnackbar(false, 'Error while reporting your Bug. Ironic, right?');
                }
            });
        }
    };

    //UPDATE AND DELETE FUNCTIONS
	$scope.deleteBug = function (id) {
        var deleteBug = $window.confirm('Are you absolutely sure you want to delete this bug?');
        if (deleteBug) {
            BugReportService.delete({id: id}, function (res) {
                if (!res.error) {
                    getAllBugs();
                    showSnackbar(true, res.message);
                } else {
                    showSnackbar(false, res.message);
                }
            });
        }
    };

	$scope.changeStatus = function (id) {
        var parameters = JSON.stringify({
            status: ((_.find($scope.bugs, {id: id})).status == 0) ? 1 : 0
        });
        BugReportService.update({ id: id }, parameters, function (result) {
            if (!result.error) {
            	getAllBugs();
                showSnackbar(true, result.message);
            }
            else {
                showSnackbar(false, result.message);
            }
        });
    }
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

//SNACKBAR FUNCTION
var showSnackbar = function (success, message) {
	if (success) {
        var x = document.getElementById("snackbarSuccess");
        x.className = "show";
        x.innerHTML = message;
        setTimeout(function () {
            x.className = x.className.replace("show", "");
        }, 4000);
    } else {
        var x = document.getElementById("snackbarError");
        x.className = "show";
        x.innerHTML = message;
        setTimeout(function () {
            x.className = x.className.replace("show", "");
        }, 4000);
	}
};