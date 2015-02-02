angular.module('starter.controllers', ['starter.services', 'leaflet-directive', 'cordovaGeolocationModule'])

.controller('AppCtrl', function($scope, $ionicModal) {

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.infoClicked = function(message) {
        alert(message);
  };

  // Log in via Facebook 
  $scope.fbLogin = function() {
    openFB.login(
        function(response) {
            if (response.status === 'connected') {
                console.log('Facebook login succeeded');
                // TODO: Replace with navigate to home
                login.close();
            } else {
                alert('Facebook login failed');
            }
        },
        {scope: 'email,publish_actions'});
  };

  /*$scope.getCurrentPosition = function() {
    cordovaGeolocationService.getCurrentPosition(function(position){
        alert(
            'Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n'
        );
    });
  };

  $scope.getCurrentPosition();*/
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

.controller('InfoCtrl', function($scope) {
})

.controller('UserCtrl', function($scope, $stateParams, User) {
    $scope.user = User.get({userId: $stateParams.userId});
})

.controller('WalksCtrl', function($scope) {
      $scope.map = {
        defaults: {
          // http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png for retina display
            tileLayer: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            zoomControlPosition: 'topright'
        },
        center: {
            lat: 51.50,
            lng: -0.12,
            zoom: 16
        }
      };
});