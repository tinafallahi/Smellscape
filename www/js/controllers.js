angular.module('starter.controllers', ['starter.services', 'leaflet-directive', 'cordovaGeolocationModule', 'ngCordova'])

.controller('LoginCtrl', function($scope, auth, $state, store) {
  $scope.signin = function() {
    auth.signin({
    closable: true,
    // This asks for the refresh token
    // So that the user never has to log in again
    authParams: {
      scope: 'openid offline_access'
    }
  }, function(profile, idToken, accessToken, state, refreshToken) {
    store.set('profile', profile);
    store.set('token', idToken);
    store.set('refreshToken', refreshToken);
    $state.go('app.home');
  }, function(error) {
    console.log("There was an error logging in", error);
  });
  };
})

.controller('AppCtrl', function($scope, $ionicModal, $state) {
  $scope.infoClicked = function(message) {
        alert(message);
  };

  $scope.add = function() {
    $state.go('app.addsmell');
  }

  $scope.find = function() {
    $state.go('app.smells');
  }

  $scope.walks = function() {
    $state.go('app.walks');
  }

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

.controller('SmellsCtrl', function($scope, $state, $ionicModal, Smell, Comment) {
    $scope.smells = Smell.query();

    $scope.map = {
        defaults: {
          // http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png for retina display
            tileLayer: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            zoomControl: false
        },
        center: {
            lat: 51.50,
            lng: -0.12,
            zoom: 16
        }, 
        events: {
          marker: {
            enable: [ 'click' ], 
            logic: 'emit'
          }
        } 
    };

    var local_icons = {
                defaultIcon: {},
                smellIcon: {
                    iconUrl: 'img/smell-marker.png',
                    iconSize:     [38, 55], // size of the icon
                    iconAnchor:   [22, 54], // point of the icon which will correspond to marker's location
                }
    }

    $scope.markers = new Array();

    $scope.smells.$promise.then(function(data) {
        for (i=0; i<data.length; i++) {
          $scope.markers.push({
            id : data[i].id,
            lat: data[i].latitude,
            lng: data[i].longitude,
            icon: local_icons.smellIcon
          });
        }
    });

    $ionicModal.fromTemplateUrl('templates/smelldetails.html', {
                  scope: $scope
                }).then(function(modal) {
                  $scope.detailsModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/addcomment.html', {
                  scope: $scope
                }).then(function(modal) {
                  $scope.commentModal = modal;
    });

    $scope.$on('leafletDirectiveMarker.click', function (e, args) {
      $scope.detailsModal.show();

      $scope.id = args.leafletEvent.target.options.id;
      $scope.smell = Smell.get({smellId: $scope.id});
      $scope.comments = Comment.query({smellId: $scope.id});
    });

    $scope.closeDetails = function() {
      $scope.detailsModal.hide();
    };

    $scope.shareOnFb = function(event) {
    	// TODO: share on Facebook
      openFB.api({
        method: 'POST',
        path: '/me/feed',
        params: {
            message: "Look at this smell: '" + $scope.smell.description
        },
        success: function () {
            alert('The smell was shared on Facebook');
        },
        error: function () {
            alert('An error occurred while sharing this smell on Facebook');
        }
      }); 
    };

    $scope.agree = function() {
      $scope.commentModal.show();
    };

    $scope.disagree = function() {
      $scope.detailsModal.hide();
      $state.go('app.addsmell');
    };

    $scope.closeComment = function() {
      $scope.commentModal.hide();
    };

    $scope.commentData = {
      // TODO: determine if even necessary
      //userid: 1, 
      agree: true, 
      body: '',
      smellid: 0
    };

    $scope.addComment = function() {
      $scope.commentData.smellid = $scope.smell.id;
      var comment = new Comment($scope.commentData);
      comment.$save();
      $scope.commentModal.hide();
      $scope.detailsModal.hide();

    };
})

/*.controller('SmellCtrl', function($scope, $stateParams, Smell) {
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
})*/

.controller('UserCtrl', function($scope, auth, $state, store) {
    //$scope.user = User.get({userId: $stateParams.userId});
    $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login');
  }
})

.controller('AddSmellCtrl', function($scope, $ionicModal, $cordovaCamera) {
      $scope.map = {
        defaults: {
          // http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png for retina display
            tileLayer: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            zoomControl: false
        },
        center: {
            lat: 51.50,
            lng: -0.12,
            zoom: 16
        }, 
        events: {} 
      };

      var local_icons = {
                defaultIcon: {},
                smellIcon: {
                    iconUrl: 'img/smell-marker.png',
                    iconSize:     [38, 55], // size of the icon
                    iconAnchor:   [22, 54], // point of the icon which will correspond to marker's location
                }
      }

      $scope.markers = new Array();

      $ionicModal.fromTemplateUrl('templates/smellform.html', {
                  id: '1', 
                  scope: $scope
                }).then(function(modal) {
                  $scope.modalAdd = modal;
      });

      $ionicModal.fromTemplateUrl('templates/smellcheck.html', {
                  id: '2',
                  scope: $scope
                }).then(function(modal) {
                  $scope.modalCheck = modal;
      });

      $ionicModal.fromTemplateUrl('templates/smellshare.html', {
                  id: '3',
                  scope: $scope
                }).then(function(modal) {
                  $scope.modalShare = modal;
      });

      $scope.$on("leafletDirectiveMap.click", function(event, args){
                // Create the login modal that we will use later
                var leafEvent = args.leafletEvent;
                if($scope.markers.length == 0) {
                  $scope.markers.push({
                      lat: leafEvent.latlng.lat,
                      lng: leafEvent.latlng.lng,
                      icon: local_icons.smellIcon,
                      focus: true
                  });
                } else {
                  var last = $scope.markers.pop();
                  $scope.markers.push({
                      lat: leafEvent.latlng.lat,
                      lng: leafEvent.latlng.lng,
                      icon: local_icons.smellIcon,
                      focus: true
                  });
                }
              $scope.modalAdd.show();
      });

      $scope.smellData = {};

    $scope.takePic = function() {
      alert("cam function! ");
      var options = { 
            quality : 75, 
            destinationType : Camera.DestinationType.DATA_URL, 
            sourceType : Camera.PictureSourceType.CAMERA, 
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
 
        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            // An error occured. Show a message to the user
        });
    }

    $scope.closeAdd = function() {
      $scope.modalAdd.hide();
      // Clear form
    };

    $scope.continueAdd = function() {
      $scope.modalAdd.hide();
      // Add data into the form
      $scope.modalCheck.show();
    };

    $scope.backToEdit = function() {
      $scope.modalCheck.hide();
      $scope.modalAdd.show();
    }

    $scope.submitSmell = function() {
      $scope.modalCheck.hide();
      // Add data to db
      $scope.modalShare.show();
    }

    $scope.smellDone = function() {
      $scope.modalShare.hide();
    }

    $scope.shareOnFb = function() {
      $scope.modalShare.hide();
    }

    $scope.$on('$destroy', function() {
      console.log('Destroying modals...');
      $scope.modalAdd.remove();
      $scope.modalCheck.remove();
      $scope.modalShare.remove();
    });
})

.controller('WalksCtrl', function($scope, $ionicModal, $timeout, Walk) {
	$scope.map = {
    	defaults: {
          	// http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png for retina display
            tileLayer: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            zoomControl: false
        },
        center: {
            lat: 51.50,
            lng: -0.12,
            zoom: 16
        }
    };

    $ionicModal.fromTemplateUrl('templates/walklist.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.walkslistModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/walkdetails.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.walksdetailsModal = modal;
    });

    $scope.walks = Walk.query();

    $timeout(function() {
    	$scope.walkslistModal.show();
    }, 3000);

    $scope.shareOnFb = function () {
    	// TODO: share on facebook
    }

    $scope.closeWalks = function () {
    	$scope.walkslistModal.hide();
    }

    $scope.showDetails = function (walkid) {
      $scope.walkdetails = Walk.get({walkId: walkid});
      $scope.walksdetailsModal.show();
    }

    $scope.closeWalk = function () {
      $scope.walksdetailsModal.hide();
    }

    $scope.startWalk = function (walkid) { 
      $scope.walksdetailsModal.hide();
      $scope.walkslistModal.hide();
      console.log($scope.walkdetails.id);
      // TODO: Start walk from here... 
    }     
});