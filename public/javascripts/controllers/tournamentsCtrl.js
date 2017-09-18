app.controller('TournamentCtrl', function ($scope, $http, $rootScope, $location, $window, ngDialog, anchorSmoothScroll, TournamentService, UserService, $ngConfirm) {

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
			tournament = $scope.tournament;
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
		$scope.teamPartner = null;
		let users = UserService.query(function () {
			$scope.usersToRegister = _.orderBy(users, ['vorname'], 'asc');
			$scope.partnersToRegister = _.reject(_.orderBy(users, ['vorname'], 'asc'), {id: $rootScope.user.id});
			$scope.partnersToRegister.push({vorname: "I'm looking for a teammate!", id: -1});
			$scope.teamPartner = _.find($scope.partnersToRegister, {id: -1});
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
		$scope.funding = false;
		$scope.reg = function () {
			let url = '/app/reg/' + $scope.tournament.id;
			let parameters = JSON.stringify({
				id: $scope.personToRegister.id,
				role: $scope.selected.value,
				team: $scope.team,
				partner: $scope.teamPartner.id,
				comment: $scope.comment,
				funding: $scope.funding
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
			$ngConfirm({
				title: 'Confirm!',
				content: 'Are you absolutely sure you want to delete this tournament?',
				scope: $scope,
				theme: 'light',
				buttons: {
					deleteBug: {
						text: 'Yes',
						btnClass: 'btn-danger',
						action: function(){
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
					},
					close: function(){
						// closes the modal
					}
				}
			});
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
			$ngConfirm({
				title: 'Confirm!',
				content: 'Are you absolutely sure you want to delete this registration?',
				scope: $scope,
				theme: 'light',
				buttons: {
					deleteBug: {
						text: 'Yes',
						btnClass: 'btn-danger',
						action: function(){
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
					},
					close: function(){
						// closes the modal
					}
				}
			});
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

		// addToCalendar function
		$scope.addToCalendar = (tournament) => {
			let url = 'https://www.google.com/calendar/render?' +
				'action=TEMPLATE&' +
				'text=' +tournament.name + '&' +
				'dates=' + moment(tournament.startdate).format('YYYYMMDD') +
				'/' + moment(tournament.enddate).add(1, 'day').format('YYYYMMDD') + '&' +
				'location=' + tournament.ort + '&' +
				'sf=true&output=xml';

			let win = window.open(url, '_blank');
			win.focus();
		};

	}
});
