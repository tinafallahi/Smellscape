angular.module('starter.controllers', ['starter.services', 'leaflet-directive', 'ngGeolocation'])

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
})

// TODO: Params might be missing something.
.controller('WalksCtrl', function($scope, $geolocation) {
    /*$scope.myPosition = $geolocation.getCurrentPosition({
            timeout: 60000
    });

    $scope.$watch('myPosition.coords', function(newValue, oldValue) {
      $scope.myPosition = $geolocation.getCurrentPosition({
            timeout: 60000
      });*/
      $scope.map = {
        defaults: {
          // http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png for retina display
            tileLayer: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            zoomControlPosition: 'topright'
        }
        /*center: {
            lat: newValue.latitude,
            lng: newValue.longitude,
            zoom: 16
        }*/
      };
    }, true);
    
});