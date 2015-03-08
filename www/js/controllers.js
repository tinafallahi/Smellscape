angular.module('starter.controllers', ['starter.services', 'leaflet-directive', 'ngCordova', 'geolocation'])

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
    store.set('accessToken', accessToken);
    store.set('profile', profile);
    store.set('token', idToken);
    store.set('refreshToken', refreshToken);

    // For OpenFB library 
    var accessToken = profile.identities[0].access_token;
    window.sessionStorage.setItem('fbtoken', accessToken);

    $state.go('app.home');
  }, function(error) {
    console.log("There was an error logging in", error);
  });
  };
})

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
})

.controller('SmellsCtrl', function($scope, $state, $ionicModal, Smell, Comment, store, geolocation) {
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
                    iconSize:     [38, 55],
                    iconAnchor:   [22, 54]
                }
    }

    geolocation.getLocation().then(function(data){
      	$scope.map.center.lat = data.coords.latitude;
      	$scope.map.center.lng = data.coords.longitude;
      });

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
      openFB.api({
        method: 'POST',
        path: '/me/feed',
        params: {
            message: "Look at this smell I found: " + $scope.smell.description
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

    var profile = store.get('profile');
    var userId = profile.user_id;

    $scope.commentData = {
      userid: userId, 
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

    $scope.$on('$destroy', function() {
      $scope.detailsModal.remove();
      $scope.commentModal.remove();
    });
})

.controller('AddSmellCtrl', function($scope, $ionicModal, $cordovaCamera, Smell, geolocation, store) {
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
                    iconSize:     [38, 55],
                    iconAnchor:   [22, 54]
                }
      }

      $scope.markers = new Array();

      geolocation.getLocation().then(function(data){
      	$scope.map.center.lat = data.coords.latitude;
      	$scope.map.center.lng = data.coords.longitude;

      	$scope.markers.push({
                      lat: data.coords.latitude,
                      lng: data.coords.longitude,
                      icon: local_icons.smellIcon,
                      focus: true
                  });

      	var profile = store.get('profile');
                var userId = profile.user_id;

                $scope.smellData = {};
                $scope.smellData.userid = userId;
                $scope.smellData.strength = 3;
                $scope.smellData.dynamicness = 3;
                $scope.smellData.likeability = 3;
                $scope.modalAdd.show();
      });

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

                var profile = store.get('profile');
                var userId = profile.user_id;

                $scope.smellData = {};
                $scope.smellData.userid = userId;
                $scope.smellData.strength = 3;
                $scope.smellData.dynamicness = 3;
                $scope.smellData.likeability = 3;
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
            // TODO: An error occured. Show a message to the user
        });
    }

    $scope.closeAdd = function() {
      $scope.modalAdd.hide();
    };

    $scope.continueAdd = function() {
      $scope.modalAdd.hide();
      $scope.modalCheck.show();
    };

    $scope.backToEdit = function() {
      $scope.modalCheck.hide();
      $scope.modalAdd.show();
    }

    $scope.submitSmell = function() {
      $scope.modalCheck.hide();

      geolocation.getLocation().then(function(data){
        $scope.smellData.latitude = data.coords.latitude;
        $scope.smellData.longitude = data.coords.longitude;

        var smell = new Smell($scope.smellData);
        smell.$save();

        $scope.modalShare.show();
      }); 
    }

    $scope.smellDone = function() {
      $scope.modalShare.hide();
    }

    $scope.shareOnFb = function() {
      openFB.api({
        method: 'POST',
        path: '/me/feed',
        params: {
            message: "Look at this smell I added: " + $scope.smellData.description
        },
        success: function () {
            alert('The smell was shared on Facebook');
        },
        error: function () {
            alert('An error occurred while sharing this smell on Facebook');
        }
      });
      $scope.modalShare.hide();
    }

    $scope.$on('$destroy', function() {
      $scope.modalAdd.remove();
      $scope.modalCheck.remove();
      $scope.modalShare.remove();
    });
})

.controller('WalksCtrl', function($scope, $ionicModal, $timeout, Walk, Smell, Point) {
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
                    iconUrl: 'img/green-marker.png',
                    iconSize:     [38, 55],
                    iconAnchor:   [22, 54]
                }, 
                pointIcon: {
                    iconUrl: 'img/walk-todo.png',
                    iconSize:     [20, 20],
                    iconAnchor:   [10, 10]
                }, 
                startPointIcon: {
                    iconUrl: 'img/start-point.png',
                    iconSize:     [20, 20],
                    iconAnchor:   [10, 10]
                }
    }

    $scope.markers = new Array();

    $scope.smells = Smell.query();
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

    $scope.pickWalk = function () {
      $scope.walkslistModal.show();
    }

    $scope.shareOnFb = function () {
      /*openFB.api({
        method: 'POST',
        path: '/me/feed',
        params: {
            message: "Look at this smell I found: " + $scope.smell.description
        },
        success: function () {
            alert('The smell was shared on Facebook');
        },
        error: function () {
            alert('An error occurred while sharing this smell on Facebook');
        }
      });*/ 
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

    $scope.startWalk = function () { 
      $scope.walksdetailsModal.hide();
      $scope.walkslistModal.hide();
      console.log($scope.map);
      $scope.points = Point.query({walkId: $scope.walkdetails.id});

      $scope.points.$promise.then(function(data) {
        for (i=0; i<data.length; i++) {
          if(i==1) {
            $scope.markers.push({
            id : data[i].id,
            lat: data[i].latitude,
            lng: data[i].longitude,
            icon: local_icons.startPointIcon
          });
            $scope.map.center.lat=data[i].latitude;
            $scope.map.center.lng=data[i].longitude;
          } else {
            $scope.markers.push({
            id : data[i].id,
            lat: data[i].latitude,
            lng: data[i].longitude,
            icon: local_icons.pointIcon
          });
          }
        }
      });
    } 

    $scope.$on('$destroy', function() {
      $scope.walkslistModal.remove();
      $scope.walksdetailsModal.remove();
    });    
});