var app = angular.module('myApp', ['ngDialog']);

app.config(['ngDialogProvider', function (ngDialogProvider) {
	ngDialogProvider.setDefaults({
		className: 'ngdialog-theme-default',
	});
	ngDialogProvider.setForceBodyReload(true);
}]);

app.controller('TournamentCtrl', function($scope, $http, ngDialog) {

	$http.get('http://localhost:3000/app/user/send')
	.then(function successCallback(user) {
		$scope.istVorstand = (user.data.role == 1) ? true : false;
	});

	$scope.showDetails = false;
	$scope.currentT_id;
	$scope.setDetails = function (t_id) {
		$scope.showDetails = true;

		$scope.currentT_id = t_id;
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
	$scope.role;
	$scope.setRole = function () {
		$scope.isSpeaker = ($scope.selected.id == 2) ? true : false;
		$scope.role = $scope.selected.value;
	};

	$scope.team = '';

	$scope.FormData={accountNum: ''};
	$scope.ShowNgDialog = function () {
		ngDialog.open({ 
			template: 'dialog',
			controller: 'TournamentCtrl',
			scope: $scope,
			width: '40%'
		});

	};

	$scope.reg = function() {

		var url = 'http://localhost:3000/app/reg/' + $scope.currentT_id;
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
		})
	}

	$http.get('http://localhost:3000/isLoggedIn')
	.then(function successCallback(arg) {
		$scope.isAuthenticated = arg.data;
	}, function errorCallback() {
		console.log('Error while getting "isAuthenticated" variable.');
	});

});

app.controller('AuthCtrl', function($scope, $http) {

	// $scope.isAuthenticated = $http.get('http://localhost:3000/isLoggedIn');
	$http.get('http://localhost:3000/isLoggedIn')
	.then(function successCallback(arg) {
		$scope.isAuthenticated = arg.data;
	}, function errorCallback() {
		console.log('Error while getting "isAuthenticated" variable.');
	});

});

var app2 = angular.module('PrflApp', []);

app2.controller('PrflCtrl', function($scope, $http) {

	$http.get('http://localhost:3000/app/user/send')
	.then(function successCallback(user) {
		$scope.istVorstand = (user.data.role == 1) ? true : false;
		$scope.vorname = user.data.vorname;
		$scope.imageURL = 'http://localhost:3000/static/images/userPics/' + user.data.image;
	});

});

app2.controller('AuthCtrl', function($scope, $http) {

	// $scope.isAuthenticated = $http.get('http://localhost:3000/isLoggedIn');
	$http.get('http://localhost:3000/isLoggedIn')
	.then(function successCallback(arg) {
		$scope.isAuthenticated = arg.data;
	}, function errorCallback() {
		console.log('Error while getting "isAuthenticated" variable.');
	});

});

var app3 = angular.module('myTApp', []);
app3.controller('TCtrl', function($scope, $http) {

	$http.get('http://localhost:3000/app/getUserTournaments')
	.then(function successCallback(res) {
		// console.log(res.data.tournaments);
		// console.log(res.data.relation);
		$scope.tournaments = res.data;
	});

});

app3.controller('AuthCtrl', function($scope, $http) {

	// $scope.isAuthenticated = $http.get('http://localhost:3000/isLoggedIn');
	$http.get('http://localhost:3000/isLoggedIn')
	.then(function successCallback(arg) {
		$scope.isAuthenticated = arg.data;
	}, function errorCallback() {
		console.log('Error while getting "isAuthenticated" variable.');
	});

});