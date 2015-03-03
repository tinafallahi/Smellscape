angular.module('starter.services', ['ngResource'])

.factory('Smell', function ($resource) {
    return $resource('/smells/:smellId');
})

.factory('User', function ($resource) {
    return $resource('/users/:userId');
})

.factory('Comment', function ($resource) {
	return $resource('/comments/:smellId');
})

.factory('Walk', function ($resource) {
	return $resource('/walks/:walkId');
});