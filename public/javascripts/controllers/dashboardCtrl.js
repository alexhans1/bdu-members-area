/**
 * Created by alex.hans on 29.07.2017.
 */
app.controller('DashboardCtrl', function ($scope, $rootScope, $http) {
	if (!$rootScope.authenticated) {
		// $location.path('/');
	} else {
		//if user is logged in then the user can see the profile page
		$rootScope.loader = true;

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
	}
});
