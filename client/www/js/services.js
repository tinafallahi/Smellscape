angular.module('starter.services', ['ngResource'])

.factory('Smell', function ($resource) {
    return $resource('http://localhost:5000/smells/:smellId');
})

.factory('User', function ($resource) {
    return $resource('http://localhost:5000/user/:userId');
});