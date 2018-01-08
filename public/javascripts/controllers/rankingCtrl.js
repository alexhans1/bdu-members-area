/**
 * Created by alex.hans on 19.07.2017.
 */

app.controller('RankingCtrl', function ($scope, $rootScope) {
	if (!$rootScope.authenticated) {
		$location.path('/');
	}
});
