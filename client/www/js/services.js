angular.module('starter.services', ['ngResource'])

.factory('Smell', function ($resource) {
    return $resource('http://smellscape.herokuapp.com//smells/:smellId');
})

.factory('User', function ($resource) {
    return $resource('http://smellscape.herokuapp.com//user/:userId');
});