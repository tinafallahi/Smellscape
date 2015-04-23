angular.module('starter.controllers', ['ionic', 'starter.services', 'leaflet-directive', 'ngCordova', 'geolocation', 'angular-carousel'])

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
  };
})

.controller('InfoCtrl', function($scope, auth, $state, store) {
    $scope.slides = [ '../img/info1.jpg', '../img/info2.jpg', '../img/info3.jpg'];

    $scope.gallerycontent = {
      template: '../templates/gallery.html',
      count: $scope.slides.length
    };
})

.controller('AppCtrl', function($scope, $ionicModal, $state) {
  $scope.infoClicked = function(message) {
        alert(message);
  };

  $scope.add = function() {
    $state.go('app.addsmell');
  };

  $scope.find = function() {
    $state.go('app.smells');
  };

  $scope.walks = function() {
    $state.go('app.walks');
  };
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
            autoDiscover: true,
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
                    iconUrl: 'img/green-marker.png',
                    iconSize:     [38, 55],
                    iconAnchor:   [22, 54]
                }
    };

    geolocation.getLocation().then(function(data){
      	$scope.map.center.lat = data.coords.latitude;
      	$scope.map.center.lng = data.coords.longitude;
      });

    $scope.markers = [];

    $scope.smells.$promise.then(function(data) {
        for (var i=0; i<data.length; i++) {
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
      };

      $scope.markers = [];

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
                $scope.imgURI = "";
                $scope.smellData.userid = userId;
                $scope.smellData.strength = 3;
                $scope.smellData.dynamicness = 3;
                $scope.smellData.likeability = 3;
                $scope.smellData.visualisation = "";
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
                if($scope.markers.length === 0) {
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
                $scope.imgURI = "";
                $scope.smellData.userid = userId;
                $scope.smellData.strength = 3;
                $scope.smellData.dynamicness = 3;
                $scope.smellData.likeability = 3;
                $scope.smellData.visualisation = "";
                $scope.modalAdd.show();
      });

      $scope.smellData = {};

    $scope.takePic = function() {
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
            $scope.smellData.visualisation = $scope.imgURI;
        }, function(err) {
            alert("Sorry having issues with the camera.");
        });
    };

    $scope.closeAdd = function() {
      $scope.modalAdd.hide();
      $scope.markers = [];
    };

    $scope.continueAdd = function() {
      $scope.modalAdd.hide();
      $scope.modalCheck.show();
    };

    $scope.backToEdit = function() {
      $scope.modalCheck.hide();
      $scope.modalAdd.show();
    };

    $scope.submitSmell = function() {
      if(!$scope.smellData.description) {
        alert("You are trying to add a smell without a name, please go back and add a name."); 
      } else {
        $scope.modalCheck.hide();

        geolocation.getLocation().then(function(data){
          $scope.smellData.latitude = data.coords.latitude;
          $scope.smellData.longitude = data.coords.longitude;

          var smell = new Smell($scope.smellData);
          smell.$save();

          $scope.modalShare.show();
        }); 
      }
    };

    $scope.smellDone = function() {
      $scope.modalShare.hide();
      $scope.markers = [];
    };

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
      $scope.markers = [];
    };

    $scope.$on('$destroy', function() {
      $scope.modalAdd.remove();
      $scope.modalCheck.remove();
      $scope.modalShare.remove();
    });
})

.controller('WalksCtrl', function($scope, $ionicModal, $timeout, Walk, Smell, Point, Comment, leafletData, geolocation, store, $state) {
  $scope.pickButton = true; 
  $scope.addButton = false; 
  $scope.quitButton = false; 
  $scope.map = {
    	defaults: {
          	// http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png for retina display
            tileLayer: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            zoomControl: false
        },
        center: {
            autoDiscover: true,
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
                }, 
                addIcon: {
                    iconUrl: 'img/smell-marker.png',
                    iconSize:     [38, 55],
                    iconAnchor:   [22, 54]
                }
    };

    $scope.markers = [];

    $scope.smells = Smell.query();
    $scope.smells.$promise.then(function(data) {
        for (var i=0; i<data.length; i++) {
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

    $ionicModal.fromTemplateUrl('templates/smellform.html', {
                  scope: $scope
                }).then(function(modal) {
                  $scope.modalAdd = modal;
      });

    $ionicModal.fromTemplateUrl('templates/smellcheck.html', {
                  scope: $scope
                }).then(function(modal) {
                  $scope.modalCheck = modal;
      });

    $ionicModal.fromTemplateUrl('templates/walkfinish.html', {
                  scope: $scope
                }).then(function(modal) {
                  $scope.modalFinish = modal;
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
      // TODO: Check if marker has an id set. 
      $scope.detailsModal.show();

      $scope.id = args.leafletEvent.target.options.id;
      $scope.smell = Smell.get({smellId: $scope.id});
      $scope.comments = Comment.query({smellId: $scope.id});
    });

    $scope.$on("leafletDirectiveMap.click", function(event, args){
                var leafEvent = args.leafletEvent;
                $scope.markers.push({
                    lat: leafEvent.latlng.lat,
                    lng: leafEvent.latlng.lng,
                    icon: local_icons.addIcon,
                    focus: true
                });

                var profile = store.get('profile');
                var userId = profile.user_id;

                $scope.smellData = {};
                $scope.imgURI = "";
                $scope.smellData.userid = userId;
                $scope.smellData.strength = 3;
                $scope.smellData.dynamicness = 3;
                $scope.smellData.likeability = 3;
                $scope.modalAdd.show();
      });

    $scope.walks = Walk.query();

    $scope.pickWalk = function () {
      $scope.walkslistModal.show();
    };

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
    };

    $scope.closeWalks = function () {
    	$scope.walkslistModal.hide();
    };

    $scope.showDetails = function (walkid) {
      // Getting walk and points information from database.
      $scope.walkdetails = Walk.get({walkId: walkid});
      $scope.points = Point.query({walkId: walkid});

      leafletData.getMap().then(function(map) {
        // Adding current location control to map. 
        $scope.locator = L.control.locate({ 
          follow: true,
          showPopup: false, 
          onLocationError: onLocationError});
        $scope.locator.addTo(map);
        function onLocationError(e) {
          alert("Current location not found: " + e.message);
        }

        // Code for adding points as waypoints
        var waypoints = [];
        var startLat; 
        var startLng;
        $scope.points.$promise.then(function(data) {
          for (var i=0; i<data.length; i++) {
            if(i===1) {
              startLat = data[i].latitude;
              startLng = data[i].longitude;
              $scope.markers.push({
                seq : data[i].sequence,
                lat: data[i].latitude,
                lng: data[i].longitude,
                icon: local_icons.startPointIcon
              });
              waypoints.push(L.latLng(data[i].latitude, data[i].longitude));
            } else {
              waypoints.push(L.latLng(data[i].latitude, data[i].longitude));
            }
          }

          // Adding smell walk route to the map. 
        $scope.routing = L.Routing.control({
          show: false,
          draggableWaypoints: false, 
          addWaypoints: false
          //createMarker: function (i, waypoint, n) { return null; } 
        });
        $scope.routing.setWaypoints(waypoints);
        // TODO: Remove the markers for the waypoints.
        $scope.routing.addTo(map);

          // Adding smell walk distance and duration to the details modal. 
          $scope.routing.getRouter().route($scope.routing.getWaypoints(), function(err, routes) {
          	console.log(err);
            console.log(routes[0].summary.totalDistance);
            $scope.walkdetails.distance = (routes[0].summary.totalDistance / 1000).toFixed(2);
            $scope.walkdetails.duration = Math.round((routes[0].summary.totalDistance * 60) / 2000);
          });

          // Adding smell walk distance from start point to the details modal.
          geolocation.getLocation().then(function(data){
            $scope.distanceRouting = L.Routing.control({
              show: false,
              draggableWaypoints: false, 
              addWaypoints: false, 
              waypoints: [
                L.latLng(data.coords.latitude, data.coords.longitude), 
                L.latLng(startLat, startLng)
              ]
            });
            $scope.distanceRouting.getRouter().route($scope.distanceRouting.getWaypoints(), function(err, routes) {
              $scope.walkdetails.distanceFromStart = Math.round((routes[0].summary.totalDistance * 60) / 2000);
            });
          });
        });
      });

      $scope.walksdetailsModal.show();
    };

    $scope.closeWalk = function () {
      $scope.walksdetailsModal.hide();
      leafletData.getMap().then(function(map) {
        map.removeControl($scope.locator);
      });
    };

    $scope.startWalk = function () { 
      $scope.pickButton = false; 
      $scope.addButton = true; 
      $scope.quitButton = true; 
      $scope.walksdetailsModal.hide();
      $scope.walkslistModal.hide();
      $scope.locator.start();

      $scope.$watch($scope.locator._event, function(newValue, oldValue) {
        console.log(newValue);
      });

      console.log($scope.locator._marker);

    }; 

    $scope.addSmell = function () {
      geolocation.getLocation().then(function(data){
        $scope.map.center.lat = data.coords.latitude;
        $scope.map.center.lng = data.coords.longitude;

        $scope.markers.push({
                      lat: data.coords.latitude,
                      lng: data.coords.longitude,
                      icon: local_icons.addIcon,
                      focus: true
                  });

        var profile = store.get('profile');
                var userId = profile.user_id;

                $scope.smellData = {};
                $scope.imgURI = "";
                $scope.smellData.userid = userId;
                $scope.smellData.strength = 3;
                $scope.smellData.dynamicness = 3;
                $scope.smellData.likeability = 3;
                $scope.modalAdd.show();
      });
      $scope.modalAdd.show();
    };

    $scope.takePic = function() {
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
      };

      $scope.closeAdd = function() {
        $scope.modalAdd.hide();
        $scope.markers.pop();
      };

      $scope.continueAdd = function() {
        $scope.modalAdd.hide();
        $scope.modalCheck.show();
      };

      $scope.backToEdit = function() {
        $scope.modalCheck.hide();
        $scope.modalAdd.show();
      };

      $scope.submitSmell = function() {
        if(!$scope.smellData.description) {
        alert("You are trying to add a smell without a name, please go back and add a name."); 
      } else {
        $scope.modalCheck.hide();

        geolocation.getLocation().then(function(data){
          $scope.smellData.latitude = data.coords.latitude;
          $scope.smellData.longitude = data.coords.longitude;

          var smell = new Smell($scope.smellData);
          smell.$save();

          $scope.modalShare.show();
        }); 
      }
      };

    $scope.quitWalk = function () {
      $scope.pickButton = true; 
      $scope.addButton = false; 
      $scope.quitButton = false; 
      $scope.modalFinish.show();

      $scope.routing.setWaypoints([]);
      $scope.markers = [];

      $scope.smells = Smell.query();
      $scope.smells.$promise.then(function(data) {
        for (var i=0; i<data.length; i++) {
          $scope.markers.push({
            id : data[i].id,
            lat: data[i].latitude,
            lng: data[i].longitude,
            icon: local_icons.smellIcon
          });
        }
      });
    };

    $scope.closeFinish = function () {
      $scope.modalFinish.hide();
    };

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
      $scope.walkslistModal.remove();
      $scope.walksdetailsModal.remove();
    });
});