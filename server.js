var pg = require('pg');
var express = require('express');
var http = require('http');
var config = require('./server/config');
var knex = require('knex')(config.knex_options);
var bookshelf = require('bookshelf')(knex);
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var models = require('./server/models')(bookshelf);

/////// APP SETUP ///////
var app = express();
server = http.createServer(app);

// Logging 
logger = {
  debug: config.debug,
  warn: config.warn,
  error: config.error
};

app.use(function(req, res, next) {
  logger.debug(req.method, req.url);
  next();
});

app.use(function(err, req, res, next) {
  logger.error(err.stack);
  res.status(500).send(err.message);
});

app.set('bookshelf', bookshelf);

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
};
 
app.use(allowCrossDomain);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());
// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
// elsewhere, to use the bookshelf client:
var bookshelf = app.get('bookshelf');
//app.use(express.static(__dirname + '/public'));

/////// ROUTES ///////
app.get('/', function (request, response) {
  response.send("Welcome to Smellscape!");
});

app.get('/api/users', function(req, res) {
  new models.User().fetchAll()
    .then(function(users) {
      res.send(users.toJSON());
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
})

/////// SERVER START ///////
app.set('port', (process.env.PORT || 5000));

server.listen(app.get('port'), function() {
  console.log("Smellscape app is running at localhost:" + app.get('port'));
});