var pg = require('pg');
var express = require('express');
var http = require('http');
var config = require('./server/config');


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
//app.use(express.static(__dirname + '/public'));
//app.set('bookshelf', bookshelf);

/////// ROUTES ///////
app.get('/', function (request, response) {
  response.send("Welcome to Smellscape!");
});

app.get('/db', function(request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM users', function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else 
      { response.send(result.rows); }
    });
  });
});

/////// SERVER START ///////
app.set('port', (process.env.PORT || 5000));

server.listen(app.get('port'), function() {
  console.log("Smellscape app is running at localhost:" + app.get('port'));
});