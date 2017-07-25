let app = angular.module('bduApp', [
	'ngRoute',
	'ngResource',
	'ngDialog',
	'ngFileUpload',
	'ngImgCrop',
	'REST_Service',
	'successService'
])
.run(function ($http, $rootScope) {

	$rootScope.personnelDebt = 0;

	$rootScope.authenticated = false;
	$rootScope.istVorstand = false;
	$rootScope.user = null;

	$http.get('/sendUser')
	.then(function (user) {
		if (user.status !== 204) {
			$rootScope.authenticated = true;
			$rootScope.istVorstand = (user.data.position === 1);
			$rootScope.user = user.data;
		}
	}, function errorCallback(err) {
		alert(err);
	});


	$rootScope.signout = function () {
		$http.get('/logout');
		$rootScope.user = null;
		$rootScope.authenticated = false;
		$rootScope.istVorstand = false;
	};
});

//durch die config wird definiert welche URIs welche controller verwenden
app.config(function ($routeProvider) {
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
	//the finances display
	.when('/finances', {
		templateUrl: 'finances.html',
		controller: 'FinanceCtrl'
	})
	//the ranking display
	.when('/ranking', {
		templateUrl: 'views/ranking.html',
		controller: 'RankingCtrl'
	})
	//the imageUpload display
	.when('/imageUpload', {
		templateUrl: 'imageUpload.html',
		controller: 'UploadCtrl'
	})
	//the bug report display
	.when('/bugReport', {
		templateUrl: 'bugReport.html',
		controller: 'bugCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
});

app.controller('mainCtrl', function ($scope, $http, $rootScope, $location, $window, ngDialog, UserService) {

	if (!$rootScope.authenticated) {
		$location.path('/');
	} else {
		//if user is logged in then the user can see the profile page

		//get the logged in user
		let user = UserService.get({id: $rootScope.user.id}, function () {
			$scope.debt = _.sumBy(user.tournaments, function (ts) {
				return (ts.pivot_price_paid - ts.pivot_price_owed)
			});
			$scope.totalPoints = _.sumBy(user.tournaments, function (ts) {
				return (ts.pivot_points)
			});
			$rootScope.personnelDebt = $scope.debt;
			$scope.user = user;
			$scope.user.tournaments = _.orderBy($scope.user.tournaments, ['startdate'], 'desc');
		});

		$scope.update = false;

		//UPDATE USER INFO
		$scope.updateUser = function () {
			let parameters = JSON.stringify({
				email: $scope.user.email,
				name: $scope.user.name,
				vorname: $scope.user.vorname,
				gender: $scope.user.gender,
				food: $scope.user.food
			});
			UserService.update({id: $rootScope.user.id}, parameters, function (result) {
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

		//CHANGE PASSWORD FUNCTION
		$scope.change = false;
		$scope.oldPassword = '';
		$scope.newPassword = '';
		$scope.confirmPassword = '';
		$scope.changePwd = function () {
			if($scope.newPassword !== $scope.confirmPassword) $scope.match = false;
			else {
				let parameters = JSON.stringify({
					newPwd: $scope.newPassword,
					oldPwd: $scope.oldPassword,
					userID: $scope.user.id
				});
				$http.post('/changePassword', parameters)
				.then(function successCallback(res) {
					if (!res.data.error) {
						$scope.change = false;
						$scope.update = false;
						showSnackbar(true, res.data.message);
					} else {
						showSnackbar(false, res.data.message);
					}
				}, function errorCallback(err) {
					showSnackbar(false, err.data);
				});
			}
		};
		$scope.match = true;
		$scope.checkMatch = function () {
			$scope.match = ($scope.newPassword === $scope.confirmPassword) || ($scope.newPassword === '' || $scope.confirmPassword === '');
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

		//DELETE REGISTRATION
		$scope.unreg = function (regID, t_id) {
			let deleteReg = $window.confirm('Are you absolutely sure you want to delete this registration?');
			if (deleteReg) {
				$http({
					url: 'app/deleteReg/' + regID,
					method: 'DELETE',
					headers: {
						"Content-Type": "application/json;charset=utf-8"
					}
				})
				.then(function successCallback(res) {
					if (!res.error) {
						_.remove($scope.user.tournaments, {id: t_id});
						showSnackbar(true, res.data.message);
					} else {
						showSnackbar(false, 'Error while removing your registration.');
					}
				}, function errorCallback(err) {
					showSnackbar(false, err.data);
				});
			}
		};

		//UPDATE REGISTRATION USING INLINE EDIT

		$scope.selected = {};
		// gets the template to ng-include for a table row / item
		$scope.getTemplate = function (tournament) {
			if (tournament.id === $scope.selected.id) return 'edit';
			return 'display';
		};

		$scope.editContact = function (tournament) {
			$scope.selected = angular.copy(tournament);
			$scope.selected.pivot_role = _.find($scope.roles, {'value': $scope.selected.pivot_role});
		};

		$scope.saveReg = function (idx, reg_id) {

			let url = '/app/updateReg';
			let team = ($scope.selected.pivot_role.value === 'speaker') ? $scope.selected.pivot_teamname : '';
			let parameters = JSON.stringify({
				reg_id: reg_id,
				role: $scope.selected.pivot_role.value,
				teamname: team,
				comment: $scope.selected.pivot_comment
			});
			$http.put(url, parameters)
			.then(function successCallback(res) {
				res = res.data;
				if (!res.error) {
					showSnackbar(true, res.message);
				} else {
					showSnackbar(false, res.message);
				}
			});

			$scope.user.tournaments[idx] = angular.copy($scope.selected);
			$scope.user.tournaments[idx].pivot_role = $scope.user.tournaments[idx].pivot_role.value;
			$scope.reset();
		};

		$scope.reset = function () {
			$scope.selected = {};
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

	}
});

app.controller('TournamentCtrl', function ($scope, $http, $rootScope, $location, $window, ngDialog, anchorSmoothScroll, TournamentService, UserService) {

	if (!$rootScope.authenticated) {
		$location.path('/');
	} else {

		$scope.fiveDaysAgo = new Date(Date.now()-432000000);

		$scope.now = new Date();

		$scope.showOnlyNew = true;

		//get all Tournaments and their Users
		let getAllTournaments = function () {
			let tournaments = TournamentService.query(function () {
				_.forEach(tournaments, function (t) {
					if (t.startdate) t.startdate = new Date(t.startdate);
					if (t.enddate) t.enddate = new Date(t.enddate);
					if (t.deadline) t.deadline = new Date(t.deadline);
				});
				if ($scope.showOnlyNew) {
					tournaments = _.filter(tournaments, function (t) {
						return (t.enddate > Date.now());
					});
				}
				$scope.tournaments = _.orderBy(tournaments, ['startdate'], 'desc');
				$scope.allTournaments = _.orderBy(tournaments, ['startdate'], 'desc');
			});
		};
		getAllTournaments();

		$scope.showAllTournaments = function () {
			$scope.showOnlyNew = !$scope.showOnlyNew;
			getAllTournaments();
		};

		$scope.setTournament = function (id) {
			getAllTournaments();

			$scope.tournament = _.find($scope.allTournaments, {id: id});
			$scope.showDetails = true;

			//check if user is registered for this tournament
			$scope.isReged = (_.find($scope.tournament.users, {'id': $rootScope.user.id}));

			anchorSmoothScroll.scrollTo('details');
		};

		//SET USERS NEW TOURNAMENT COUNT TO 0
		UserService.update({id: $rootScope.user.id}, {new_tournament_count: 0}, function (result) {
			if (!result.error) {
				$rootScope.user.new_tournament_count = 0;
			}
		});

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

		$scope.personToRegister = $rootScope.user;
		let users = UserService.query(function () {
			$scope.usersToRegister = _.orderBy(users, ['vorname'], 'asc');
		});

		$scope.team = '';
		$scope.comment = '';

		$scope.isSpeaker = false;
		$scope.setRole = function () {
			$scope.isSpeaker = ($scope.selected.id === 2);
		};


		$scope.FormData = {accountNum: ''};
		$scope.ShowNgDialog = function () {
			ngDialog.open({
				template: 'tournamentsDialog.html',
				controller: 'TournamentCtrl',
				scope: $scope
			});
		};

		//REG FUNCTION TO BE CLICKED FROM THE DIALOG
		$scope.reg = function () {

			let url = '/app/reg/' + $scope.tournament.id;
			let parameters = JSON.stringify({
				id: $scope.personToRegister.id,
				role: $scope.selected.value,
				team: $scope.team,
				comment: $scope.comment
			});
			$http.post(url, parameters)
			.then(function successCallback(response) {
				$scope.closeThisDialog();
				if (response.status === 200) {
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
			let deleteTournament = $window.confirm('Are you absolutely sure you want to delete this tournament?');
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

		//TOGGLE THROUGH LANGUAGES
		$scope.toggleVal = 'all';
		$scope.toggle = function () {
			if ($scope.toggleVal === 'en') {
				$scope.tournaments = _.filter($scope.allTournaments, {language: 'other'});
				$scope.toggleVal = 'other';
			} else if ($scope.toggleVal === 'de') {
				$scope.tournaments = _.filter($scope.allTournaments, {language: 'en'});
				$scope.toggleVal = 'en';
			} else if ($scope.toggleVal === 'other') {
				$scope.tournaments = $scope.allTournaments;
				$scope.toggleVal = 'all';
			} else {
				$scope.tournaments = _.filter($scope.allTournaments, {language: 'de'});
				$scope.toggleVal = 'de';
			}
		};

		//DELETE REGISTRATION
		$scope.unreg = function (users) {
			let regID = _.find(users, {'id': $rootScope.user.id}).pivot_id;
			let deleteReg = $window.confirm('Are you absolutely sure you want to delete this registration?');
			if (deleteReg) {
				$http({
					url: 'app/deleteReg/' + regID,
					method: 'DELETE',
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
					showSnackbar(false, err.data);
				});
			}
		};

		//EDIT TOURNAMENT FUNCTION
		$scope.showUpdate = false;

		$scope.submitUpdate = function () {

			if ($scope.tournament.startdate) $scope.tournament.startdate = new Date(toLocal($scope.tournament.startdate));
			if ($scope.tournament.enddate) $scope.tournament.enddate = new Date(toLocal($scope.tournament.enddate));
			if ($scope.tournament.deadline) $scope.tournament.deadline = new Date(toLocal($scope.tournament.deadline));

			TournamentService.update({id: $scope.tournament.id}, $scope.tournament, function (result) {
				if (!result.error) {
					getAllTournaments();
					showSnackbar(true, result.message);
				}
				else {
					showSnackbar(false, result.message);
				}
			});
			$scope.showUpdate = false;
		};
	}
});

app.controller('OverviewCtrl', function ($scope, $http, $rootScope, $window, $location, ngDialog, anchorSmoothScroll, TournamentService) {

	if (!$rootScope.authenticated) {
		$location.path('/');
	} else {

		//UEBERSICHT ANMELDUNGEN

		//get all Tournaments and their Users
		let getAllTournaments = function () {
			$rootScope.loader = true;
			let tournaments = TournamentService.query(function () {
				$scope.tournamentsusers = _.orderBy(tournaments, ['startdate'], 'desc');
				$rootScope.loader = false;
			});
		};
		getAllTournaments();

		// function to sort tournaments by key
		let tournamentDir = 'asc';
		$scope.sortTournaments = function (key) {
			$scope.tournamentsusers = _.orderBy($scope.tournamentsusers, [key], tournamentDir);
			tournamentDir = (tournamentDir === 'asc') ? 'desc' : 'asc';
		};

		// function to sort users by key
		let userDir = 'asc';
		$scope.sortUsers = function (key) {
			$scope.tournament.users = _.orderBy($scope.tournament.users, [key], userDir);
			userDir = (userDir === 'asc') ? 'desc' : 'asc';
		};

		//SET ATTENDED TO 1
		$scope.went = function (role, reg_id, typeAsInt) {
			$rootScope.loader = true;
			let price = (role === 'speaker') ? $scope.tournament.speakerprice : $scope.tournament.judgeprice;
			let parameters = JSON.stringify({
				reg_id: reg_id,
				attended: typeAsInt,
				price: price
			});
			$http.put('/app/setAttended', parameters)
			.then(function successCallback(response) {
				response = response.data;
				if (!response.error) {
					let tournaments = TournamentService.query(function () {
						$scope.tournamentsusers = _.orderBy(tournaments, ['startdate'], 'desc');
						$scope.tournament = _.find($scope.tournamentsusers, {id: $scope.tournament.id});
					});
					showSnackbar(true, response.message);
				} else {
					showSnackbar(false, response.message);
				}
				$rootScope.loader = false;
			}, function errorCallback(err) {
				showSnackbar(false, err.data);
				$rootScope.loader = false;
			});
		};

		//DELETE REGISTRATION
		$scope.delete = function (regID) {
			let deleteReg = $window.confirm('Are you absolutely sure you want to delete this registration?');
			if (deleteReg) {
				$http({
					url: 'app/deleteReg/' + regID,
					method: 'DELETE',
					headers: {
						"Content-Type": "application/json;charset=utf-8"
					}
				})
				.then(function successCallback(response) {
					response = response.data;
					if (!response.error) {
						let tournaments = TournamentService.query(function () {
							$scope.tournamentsusers = _.orderBy(tournaments, ['startdate'], 'desc');
							$scope.tournament = _.find($scope.tournamentsusers, {id: $scope.tournament.id});
						});
						showSnackbar(true, response.message);
					} else {
						showSnackbar(false, response.message);
					}
				}, function errorCallback(err) {
					console.log(err);
					showSnackbar(false, response.message);
				});
			}
		};

		//OPEN USERS TABLE
		$scope.showUsers = false;

		$scope.goToUsers = function (tournament) {
			$scope.tournament = tournament;
			$scope.sortUsers('pivot_created_at');
			$scope.showUsers = true;

			anchorSmoothScroll.scrollTo('users');
		};

		//OPEN IMAGE DIALOG
		$scope.ShowImageDialog = function (Vorname, URL) {
			$scope.imgDialogVorname = Vorname;
			$scope.imgDialogURL = URL;
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

app.controller('VorstandCrtl', function ($scope, $http, $rootScope, TournamentService) {

	if (!$rootScope.authenticated) {
		$location.path('/');
	} else {

		$scope.newTournament = {
			name: '',
			ort: '',
			startdate: '',
			enddate: '',
			deadline: '',
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

			//convert dates
			if ($scope.newTournament.startdate) $scope.newTournament.startdate = new Date(toLocal($scope.newTournament.startdate));
			if ($scope.newTournament.enddate) $scope.newTournament.enddate = new Date(toLocal($scope.newTournament.enddate));
			if ($scope.newTournament.deadline) $scope.newTournament.deadline = new Date(toLocal($scope.newTournament.deadline));

			if ($scope.newTournament.name === '' || $scope.newTournament.language === '') {
				showSnackbar(false, 'Name und Sprache müssen gesetzt werden.');
			} else {
				let startdate = $scope.newTournament.startdate;
				TournamentService.save($scope.newTournament, (res) => {
					if (!res.error) {
						if(moment(startdate).unix() > Date.now()/1000) {
							$rootScope.user.new_tournament_count++;
						}
						showSnackbar(true, res.message);
					} else {
						showSnackbar(false, 'Error while adding new Tournament.');
					}
				});
			}

			$scope.newTournament = {
				name: '',
				ort: '',
				startdate: '',
				enddate: '',
				deadline: '',
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
		};

	}
});

app.controller('FinanceCtrl', function ($scope, $http, $rootScope, $location, anchorSmoothScroll, UserService) {

	if (!$rootScope.authenticated) {
		$location.path('/');
	} else {

		//UEBERSICHT Finanzen

		//get all Users and their Tournaments
		let getAllUsers = function () {
			$rootScope.loader = true;

			let users = UserService.query(function () {
				$scope.totalClubDebt = 0;
				_.each(users, function (user) {
					let totalPoints = 0;
					let totalDebt = 0;
					_.each(user.tournaments, function (tournament) {
						totalPoints += tournament.pivot_points;
						totalDebt += (tournament.pivot_price_owed - tournament.pivot_price_paid);
					});
					user.totalPoints = totalPoints;
					user.totalDebt = totalDebt;
					$scope.totalClubDebt += totalDebt;
				});
				$scope.users = _.orderBy(users, ['last_login'], 'desc');
				$rootScope.loader = false;
			});
		};
		getAllUsers();

		// function to sort users by key
		let userDir = 'asc';
		$scope.sortUsers = function (key) {
			$scope.users = _.orderBy($scope.users, [key], userDir);
			userDir = (userDir === 'asc') ? 'desc' : 'asc';
		};

		// function to sort tournaments by key
		let tournamentDir = 'asc';
		$scope.sortTournaments = function (key) {
			$scope.user.tournaments = _.orderBy($scope.user.tournaments, [key], tournamentDir);
			tournamentDir = (tournamentDir === 'asc') ? 'desc' : 'asc';
		};

		$scope.showTournaments = false;

		$scope.goToTournaments = function (user) {
			$scope.user = user;
			$scope.sortTournaments('startdate');
			$scope.showTournaments = true;

			anchorSmoothScroll.scrollTo('tournaments');
		};

		//UPDATE REGISTRATION USING INLINE EDIT

		$scope.selected = {};
		// gets the template to ng-include for a table row / item
		$scope.getTemplate = function (tournament) {
			if (tournament.id === $scope.selected.id) return 'edit';
			return 'display';
		};

		$scope.editReg = function (tournament) {
			$scope.selected = angular.copy(tournament);
		};

		$scope.saveReg = function (idx, reg_id) {

			let url = '/app/updateReg';
			let parameters = JSON.stringify({
				reg_id: reg_id,
				price_paid: $scope.selected.pivot_price_paid,
				price_owed: $scope.selected.pivot_price_owed
			});
			$http.put(url, parameters)
			.then(function successCallback(res) {
				res = res.data;
				if (!res.error) {
					showSnackbar(true, res.message);
				} else {
					showSnackbar(false, res.message);
				}
			});

			$scope.user.tournaments[idx] = angular.copy($scope.selected);
			$scope.reset();
		};

		$scope.reset = function () {
			$scope.selected = {};
		};

		$scope.setPaid = function (reg_id, amount) {
			let url = '/app/updateReg';
			let parameters = JSON.stringify({
				reg_id: reg_id,
				price_paid: amount
			});
			$http.put(url, parameters)
			.then(function successCallback(res) {
				res = res.data;
				if (!res.error) {
					$scope.user.tournaments[_.findIndex($scope.user.tournaments, { 'pivot_id': reg_id })].pivot_price_paid = amount;
					showSnackbar(true, res.message);
				} else {
					showSnackbar(false, res.message);
				}
			});
		};

	}
});

app.controller('ResetCtrl', function ($scope, $http) {

	$scope.email = '';

	$scope.message = '';

	$scope.submit = function () {
		$http.post('/forgot', {email: $scope.email})
		.then(function successCallback() {
			$scope.message = 'An E-Mail has been sent to you with further instructions. Since we are financing this project by advertising penis enlargement instruments you should ALSO CHECK YOUR SPAM FOLDER.';
		}, function errorCallback(err) {
			$scope.message = err;
		});
	};
});

app.controller('bugCtrl', function ($scope, $http, $window, BugReportService) {
	$scope.newBug = {
		description: '',
		type: ''
	};

	let allBugs;
	let getAllBugs = function () {
		$http.get('/bugs').success(function (bugs) {
			allBugs = bugs.data;
			$scope.bugs = _.filter(_.orderBy(bugs.data, ['created_at'], 'desc'), {'status': 0});
		});
	};
	getAllBugs();

	let filter = true;
	$scope.filterBugs = function () {
		if (filter) $scope.bugs = _.filter($scope.bugs, {'status': 0});
		else $scope.bugs = _.orderBy(allBugs, ['created_at'], 'desc');
		filter = !filter;
	};

	$scope.reportBug = function () {
		if ($scope.newBug.description === '' || $scope.newBug.type === '') {
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
		let deleteBug = $window.confirm('Are you absolutely sure you want to delete this bug?');
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
		let parameters = JSON.stringify({
			status: ((_.find($scope.bugs, {id: id})).status === 0) ? 1 : 0
		});
		BugReportService.update({id: id}, parameters, function (result) {
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

app.controller('authCtrl', function ($scope, $http, $rootScope, $location) {
	$scope.loginuser = {
		email: '',
		password: ''
	};

	$scope.reguser = {
		email: '',
		password: '',
		name: '',
		vorname: '',
		gender: '',
		food: '',
		signup_password: ''
	};
	$scope.error_message = '';

	$scope.login = function () {
		$http.post('/login', $scope.loginuser).success(function (data) {
			if (data.state === 'success') {
				$rootScope.authenticated = true;
				$rootScope.user = data.user;
				$rootScope.istVorstand = (data.user.position === 1);
				$location.path('/profile');
			}
			else {
				$scope.error_message = data.message;
			}
		});
	};

	$scope.register = function () {
		if ($scope.match) {
			$http.post('/signup', $scope.reguser).success(function (data) {
				if (data.state === 'success') {
					$rootScope.authenticated = true;
					$rootScope.user = data.user;
					$rootScope.istVorstand = (data.user.position === 1);
					$location.path('/profile');
				}
				else {
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

	$scope.checkMatch = function () {
		$scope.match = ($scope.reguser.password === $scope.pwd2) && $scope.confirmFill;
	};
});

// FILE UPLOADER

app.controller('UploadCtrl', ['$scope', 'Upload', '$timeout', '$http', '$rootScope', '$location', '$q',
	function ($scope, Upload, $timeout, $http, $rootScope, $location) {

		$scope.submit = false;

		$scope.upload = function (dataUrl, name) {
			Upload.upload({
				url: '/app/user/image',
				data: {
					pic: Upload.dataUrltoBlob(dataUrl, name)
				}
			}).then(function (response) {
				showSnackbar(!response.data.error, response.data.message);
				$location.path('/profile');
			});
		}
	}]);

//NG-SCROLL

app.service('anchorSmoothScroll', function () {

	this.scrollTo = function (eID) {

		// This scrolling function
		// is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

		let startY = currentYPosition();
		let stopY = elmYPosition(eID);
		let distance = stopY > startY ? stopY - startY : startY - stopY;
		if (distance < 100) {
			scrollTo(0, stopY);
			return;
		}
		let speed = Math.round(distance / 100);
		if (speed >= 20) speed = 20;
		let step = Math.round(distance / 25);
		let leapY = stopY > startY ? startY + step : startY - step;
		let timer = 0;
		if (stopY > startY) {
			for (let i = startY; i < stopY; i += step) {
				setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
				leapY += step;
				if (leapY > stopY) leapY = stopY;
				timer++;
			}
			return;
		}
		for (let i = startY; i > stopY; i -= step) {
			setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
			leapY -= step;
			if (leapY < stopY) leapY = stopY;
			timer++;
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
			let elm = document.getElementById(eID);
			let y = elm.offsetTop;
			let node = elm;
			while (node.offsetParent && node.offsetParent !== document.body) {
				node = node.offsetParent;
				y += node.offsetTop;
			}
			return y;
		}

	};

});

//SNACKBAR FUNCTION
showSnackbar = function (success, message) {
	if (success) {
		let x = document.getElementById("snackbarSuccess");
		x.className = "show";
		x.innerHTML = message;
		setTimeout(function () {
			x.className = x.className.replace("show", "");
		}, 4000);
	} else {
		let x = document.getElementById("snackbarError");
		x.className = "show";
		x.innerHTML = message;
		setTimeout(function () {
			x.className = x.className.replace("show", "");
		}, 4000);
	}
};

//CONVERT DATE OBJECT TO LOCAL TIMEZONE

function toLocal(date) {
	let local = new Date(date);
	local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return local.toJSON();
}
