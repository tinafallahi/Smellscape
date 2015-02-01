// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'leaflet-directive'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  openFB.init({appId: '563717677062790'});
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.addsmell', {
    url: "/addsmell",
    views: {
      'menuContent': {
        templateUrl: "templates/addsmell.html"
      }
    }
  })

  .state('app.login', {
    url: "/login",
    views: {
      'menuContent': {
        templateUrl: "templates/login.html",
      }
    }
  })
    .state('app.smells', {
  url: "/smells",
  views: {
      'menuContent': {
          templateUrl: "templates/smells.html",
          controller: 'SmellsCtrl'
      }
  }
})

    .state('app.user', {
  url: "/user/:userId",
  views: {
      'menuContent' :{
          templateUrl: "templates/user.html",
          controller: "UserCtrl"
      }
  }
})

  .state('app.smell', {
    url: "/smells/:smellId",
    views: {
        'menuContent': {
          templateUrl: "templates/smell.html",
          controller: 'SmellCtrl'
      }
    }
})

  .state('app.walks', {
    url: '/walks',
    views: {
      'menuContent': {
      templateUrl: 'templates/walks.html',
      controller: 'WalksCtrl'
    }
  }
});
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
});
