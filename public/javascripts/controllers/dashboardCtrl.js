/**
 * Created by alex.hans on 29.07.2017.
 */
app.controller('DashboardCtrl', function ($scope, $rootScope, $http, UserService, TournamentService, $interval) {
	if (!$rootScope.authenticated) {
		// $location.path('/');
	} else {
		//if user is logged in then the user can see the profile page
		$rootScope.loader = true;

		// Club Debt Chart
		$http.get('/dashboard/clubDebt')
		.then(function(response) {
			let data = response.data;

			$(function () {
				Highcharts.stockChart('container', {
					chart: {
						type: 'line'
					},
					title: {
						text: 'Total Club Debt: ' + data.data[data.data.length-1][1]
					},
					yAxis: {
						title: {
							text: 'Debt'
						}
					},
					xAxis: {
						type: 'datetime'
					},
					tooltip: {
						shared: false,
						crosshairs: true
					},
					plotOptions: {
						column: {
							pointPadding: 0.2,
							borderWidth: 0
						}
					},
					series: [data]
				});
			});
			$rootScope.loader = false;
		});

		// Members Overview
		let users = UserService.query(() => {
			$scope.users = users;
			$scope.activeUsers = 0;
			$scope.registeredUsers = 0;
			$scope.femaleUsers = 0;
			$scope.maleUsers = 0;
			$scope.postUsers = 0;
			$scope.femaleTournamentUsers = 0;
			$scope.maleTournamentUsers = 0;
			$scope.postTournamentUsers = 0;
			$scope.femaleRegistrations = 0;
			$scope.maleRegistrations = 0;
			$scope.postRegistrations = 0;
			$scope.femaleTotalPoints = 0;
			$scope.maleTotalPoints = 0;
			$scope.postTotalPoints = 0;
			users.forEach((user) => {
				if (user.gender === 'm') {
					$scope.maleUsers++;
					if (user.tournaments.length) {
						$scope.maleTournamentUsers++;
						user.tournaments.forEach((tournament) => {
							if (moment(tournament.startdate).isBefore(moment())) {
								$scope.maleRegistrations++;
								$scope.maleTotalPoints += tournament.pivot_points;
							}
						});
					}
				}
				else if (user.gender === 'f') {
					$scope.femaleUsers++;
					if (user.tournaments.length) {
						$scope.femaleTournamentUsers++;
						user.tournaments.forEach((tournament) => {
							if (moment(tournament.startdate).isBefore(moment())) {
								$scope.femaleRegistrations++;
								$scope.femaleTotalPoints += tournament.pivot_points;
							}
						});
					}
				}
				else {
					$scope.postUsers++;
					if (user.tournaments.length) {
						$scope.postTournamentUsers++;
						user.tournaments.forEach((tournament) => {
							if (moment(tournament.startdate).isBefore(moment())) {
								$scope.postRegistrations++;
								$scope.postTotalPoints += tournament.pivot_points;
							}
						});
					}
				}

				let currentTournaments = _.filter(user.tournaments, (tournament) => {
					return moment(tournament.startdate).isAfter(moment());
				});
				let wentTournaments = _.filter(user.tournaments, (tournament) => {
				    return tournament.pivot_attended;
				});
				if (currentTournaments.length) $scope.registeredUsers++;
				if (wentTournaments.length) $scope.activeUsers++;
			});

			//make sure you don't carriage return the css inline statement, or else it'll be error as ILLEGAL
			$('<style>@keyframes activeUsers{to {stroke-dashoffset:'+(440-$scope.activeUsers/users.length*440)+';}}</style>').appendTo('head');
			$('<style>@keyframes registeredUsers{to {stroke-dashoffset:'+(440-$scope.registeredUsers/users.length*440)+';}}</style>').appendTo('head');

			// Gender Charts
			setTimeout(function () {
				createCharts();
			}, 500);

			function createCharts() {

				$(function () {
					Highcharts.chart('genderContainer1', {
						chart: {
							backgroundColor:'rgba(255, 255, 255, 0.0)',
							plotBackgroundColor: null,
							plotBorderWidth: null,
							plotShadow: false,
							type: 'pie'
						},
						exporting: { enabled: false },
						title: {
							text: '♂ and ♀ users',
							style: {
								color: '#f7f7fa',
								fontSize: '10px'
							}
						},
						tooltip: {
							pointFormat: '<b>{point.name}: {point.y:.1f}</b> ({point.percentage:.1f} %)'
						},
						plotOptions: {
							pie: {
								dataLabels: {
									enabled: false
									// format: '<b>{point.name}</b>: {point.percentage:.1f} %'
								},
								colors: ['#4b86bd', '#bd3034', '#DBD41E']
							}
						},
						series: [{
							data: [{
								name: 'Male Users',
								y: $scope.maleUsers
							}, {
								name: 'Female Users',
								y: $scope.femaleUsers
							}, {
								name: 'Other Users',
								y: $scope.postUsers
							}]
						}]
					});
				});

				setTimeout(() => {
					$(function () {
						Highcharts.chart('genderContainer2', {
							chart: {
								backgroundColor:'rgba(255, 255, 255, 0.0)',
								plotBackgroundColor: null,
								plotBorderWidth: null,
								plotShadow: false,
								type: 'pie'
							},
							exporting: { enabled: false },
							title: {
								text: '♂ and ♀ active users',
								style: {
									color: '#f7f7fa',
									fontSize: '10px'
								}
							},
							tooltip: {
								pointFormat: '<b>{point.name}: {point.y:.1f}</b> ({point.percentage:.1f} %)'
							},
							plotOptions: {
								pie: {
									dataLabels: {
										enabled: false
										// format: '<b>{point.name}</b>: {point.percentage:.1f} %'
									},
									colors: ['#4b86bd', '#bd3034', '#DBD41E']
								}
							},
							series: [{
								data: [{
									name: 'Male Active Users',
									y: $scope.maleTournamentUsers
								}, {
									name: 'Female Active Users',
									y: $scope.femaleTournamentUsers
								}, {
									name: 'Other Active Users',
									y: $scope.postTournamentUsers
								}]
							}]
						});
					});
				}, 600);

				setTimeout(() => {
					$(function () {
						Highcharts.chart('genderContainer3', {
							chart: {
								backgroundColor:'rgba(255, 255, 255, 0.0)',
								plotBackgroundColor: null,
								plotBorderWidth: null,
								plotShadow: false,
								type: 'pie'
							},
							exporting: { enabled: false },
							title: {
								text: '♂ and ♀ registrations',
								style: {
									color: '#f7f7fa',
									fontSize: '10px'
								}
							},
							tooltip: {
								pointFormat: '<b>{point.name}: {point.y:.1f}</b> ({point.percentage:.1f} %)'
							},
							plotOptions: {
								pie: {
									dataLabels: {
										enabled: false
										// format: '<b>{point.name}</b>: {point.percentage:.1f} %'
									},
									colors: ['#4b86bd', '#bd3034', '#DBD41E']
								}
							},
							series: [{
								data: [{
									name: 'Male Registrations',
									y: $scope.maleRegistrations
								}, {
									name: 'Female Registrations',
									y: $scope.femaleRegistrations
								}, {
									name: 'Other Registrations',
									y: $scope.postRegistrations
								}]
							}]
						});
					});
				}, 900);

				setTimeout(() => {
					$(function () {
						Highcharts.chart('genderContainer4', {
							chart: {
								backgroundColor:'rgba(255, 255, 255, 0.0)',
								type: 'column'
							},
							exporting: { enabled: false },
							title: {
								text: 'Avg points',
								style: {
									color: '#f7f7fa',
									fontSize: '10px'
								}
							},
							plotOptions: {
								column: {
									colorByPoint: true,
									colors: ['#4b86bd', '#bd3034', '#DBD41E']
								}
							},
							xAxis: {
								type: 'category',
								labels: {
									rotation: -45,
									style: {
										color: '#f7f7fa',
										fontSize: '13px',
									}
								}
							},
							yAxis: {
								title: {
									enabled: false
								},
								labels: {
									style: {
										color: '#f7f7fa',
										fontSize: '13px',
									}
								}
							},
							legend: {
								enabled: false
							},
							series: [{
								name: 'Points',
								data: [
									['Men', $scope.maleTotalPoints/$scope.maleTournamentUsers],
									['Women', $scope.femaleTotalPoints/$scope.femaleTournamentUsers],
									['Other', $scope.postTotalPoints/$scope.postTournamentUsers]
								]
							}]
						});
					});
				}, 1200);

				setTimeout(() => {
					$(function () {
						Highcharts.chart('genderContainer5', {
							chart: {
								backgroundColor:'rgba(255, 255, 255, 0.0)',
								type: 'column'
							},
							exporting: { enabled: false },
							title: {
								text: 'Avg points per registration',
								style: {
									color: '#f7f7fa',
									fontSize: '10px'
								}
							},
							plotOptions: {
								column: {
									colorByPoint: true,
									colors: ['#4b86bd', '#bd3034', '#DBD41E']
								}
							},
							xAxis: {
								type: 'category',
								labels: {
									rotation: -45,
									style: {
										color: '#f7f7fa',
										fontSize: '13px',
									}
								}
							},
							yAxis: {
								title: {
									enabled: false
								},
								labels: {
									style: {
										color: '#f7f7fa',
										fontSize: '13px',
									}
								}
							},
							legend: {
								enabled: false
							},
							series: [{
								name: 'Points',
								data: [
									['Men', $scope.maleTotalPoints/$scope.maleRegistrations],
									['Women', $scope.femaleTotalPoints/$scope.femaleRegistrations],
									['Other', $scope.postTotalPoints/$scope.postRegistrations]
								]
							}]
						});
					});
				}, 1500);
			}

	});

		// Tournaments Overview
		let tournaments = TournamentService.query(() => {
			$scope.tournaments = tournaments;
			$scope.wins = 0;
			tournaments.forEach((tournament) => {
				let winningUsers = _.filter(tournament.users, (user) => {
					return user.pivot_success === 'win' || user.pivot_success === 'win2';
				});
				if (winningUsers.length) $scope.wins++;
			});

			//make sure you don't carriage return the css inline statement, or else it'll be error as ILLEGAL
			$('<style>@keyframes activeUsers{to {stroke-dashoffset:'+(440-$scope.activeUsers/users.length*440)+';}}</style>').appendTo('head');
			$('<style>@keyframes registeredUsers{to {stroke-dashoffset:'+(440-$scope.registeredUsers/users.length*440)+';}}</style>').appendTo('head');

		});

		// Time since existence of BDU
		let foundationDate = moment('2001-12-17T23:00:00.000+02:00');
		$interval(() => {
			$scope.timeExisting = moment.preciseDiff(foundationDate, moment());
		}, 1000);

	}
});
