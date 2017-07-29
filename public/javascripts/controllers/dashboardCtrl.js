/**
 * Created by alex.hans on 29.07.2017.
 */
app.controller('DashboardCtrl', function ($scope, $rootScope, $http, UserService) {
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
						text: 'Club Debt over Time'
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
			users.forEach((user) => {
				if (moment(user.last_login).isAfter(moment().subtract(2, 'weeks'))) $scope.activeUsers++;

				let currentTournaments = _.filter(user.tournaments, (tournament) => {
					return moment(tournament.startdate).isAfter(moment());
				});
				if (currentTournaments.length) $scope.registeredUsers++;
			});

			//make sure you don't carriage return the css inline statement, or else it'll be error as ILLEGAL
			$('<style>@keyframes activeUsers{to {stroke-dashoffset:'+(440-$scope.activeUsers/users.length*440)+';}}</style>').appendTo('head');
			$('<style>@keyframes registeredUsers{to {stroke-dashoffset:'+(440-$scope.registeredUsers/users.length*440)+';}}</style>').appendTo('head');

		});

	}
});
