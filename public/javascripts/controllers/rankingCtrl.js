/**
 * Created by alex.hans on 19.07.2017.
 */

app.controller('RankingCtrl', function ($scope, $rootScope, $http) {
	if (!$rootScope.authenticated) {
		// $location.path('/');
		$scope.ranking = 'World';
	} else {
		//if user is logged in then the user can see the profile page

		$http.get('/ranking/all')
		.then(function(response) {
			let data = response.data;

			$(function () {
				let myChart = Highcharts.chart('container', {
					chart: {
						type: 'line',
						zoomType: 'x'
					},
					title: {
						text: 'BDU Ranking'
					},
					xAxis: {
						type: 'datetime'
					},
					yAxis: {
						title: {
							text: 'Points'
						}
					},
					tooltip: {
						shared: true,
						crosshairs: true
					},
					plotOptions: {
						column: {
							pointPadding: 0.2,
							borderWidth: 0
						}
					},
					series: data
				});
			});
		});
	}
});
