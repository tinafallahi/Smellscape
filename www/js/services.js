angular.module('starter.services', ['ngResource'])

.factory('Smell', function ($resource) {
    return $resource('/smells/:smellId');
})

.factory('User', function ($resource) {
    return $resource('/user/:userId');
});