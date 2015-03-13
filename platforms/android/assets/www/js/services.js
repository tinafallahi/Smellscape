angular.module('starter.services', ['ngResource'])

.factory('Smell', function ($resource) {
    return $resource('https://smellscape.herokuapp.com/smells/:smellId');
})

.factory('User', function ($resource) {
    return $resource('https://smellscape.herokuapp.com/users/:userId');
})

.factory('Comment', function ($resource) {
	return $resource('https://smellscape.herokuapp.com/comments/:smellId');
})

.factory('Walk', function ($resource) {
	return $resource('https://smellscape.herokuapp.com/walks/:walkId');
})

.factory('Point', function ($resource) {
	return $resource('https://smellscape.herokuapp.com/points/:walkId');
});