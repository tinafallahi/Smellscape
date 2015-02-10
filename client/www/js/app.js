// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 
  'starter.controllers', 
  'leaflet-directive',
  'auth0',
  'angular-storage',
  'angular-jwt'])

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

.config(function($stateProvider, $urlRouterProvider, authProvider, $httpProvider,
  jwtInterceptorProvider) {
  openFB.init({appId: '563717677062790'});
  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "LoginCtrl"
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl', 
    data: {
        requiresLogin: true
      }
  })

  .state('app.addsmell', {
    url: "/addsmell",
    views: {
      'menuContent': {
        templateUrl: "templates/addsmell.html",
        controller: 'AddSmellCtrl'
      }
    }
  })

  .state('app.home', {
    url: "/home",
    views: {
      'menuContent': {
        templateUrl: "templates/home.html",
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

  // Configure Auth0
  authProvider.init({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    loginState: 'login'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');

  jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
    var idToken = store.get('token');
    var refreshToken = store.get('refreshToken');
    if (!idToken || !refreshToken) {
      return null;
    }
    if (jwtHelper.isTokenExpired(idToken)) {
      return auth.refreshIdToken(refreshToken).then(function(idToken) {
        store.set('token', idToken);
        return idToken;
      });
    } else {
      return idToken;
    }
  }

  $httpProvider.interceptors.push('jwtInterceptor');
}).run(function($rootScope, auth, store) {
  $rootScope.$on('$locationChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        auth.authenticate(store.get('profile'), token);
      }
    }

  });
});
