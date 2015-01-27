angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  // Log in via Facebook 
  $scope.fbLogin = function() {
    openFB.login(
        function(response) {
            if (response.status === 'connected') {
                console.log('Facebook login succeeded');
                $scope.closeLogin();
            } else {
                alert('Facebook login failed');
            }
        },
        {scope: 'email,publish_actions'});
}
})

.controller('SmellsCtrl', function($scope, Smell) {
    $scope.smells = Smell.query();
})

.controller('SmellCtrl', function($scope, $stateParams, Smell) {
    $scope.smell = Smell.get({smellId: $stateParams.smellId});

    $scope.share = function(event) {
    openFB.api({
        method: 'POST',
        path: '/me/feed',
        params: {
            message: "Look at this smell: '" + $scope.smell.association + "' at " +
                $scope.smell.longitude + " " + $scope.smell.latitude
        },
        success: function () {
            alert('The smell was shared on Facebook');
        },
        error: function () {
            alert('An error occurred while sharing this smell on Facebook');
        }
    });
};
})

.controller('UserCtrl', function($scope, $stateParams, User) {
    $scope.user = User.get({userId: $stateParams.userId});
});
