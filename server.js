var pg = require('pg');
var express = require('express');
var http = require('http');
var config = require('./server/config');
var knex = require('knex')(config.knex_options);
var bookshelf = require('bookshelf')(knex);
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var models = require('./server/models')(bookshelf);
var url = require('url');
var forecast = require('forecast');

/////// APP SETUP ///////
var app = express();

// Logging 
logger = {
  debug: config.debug,
  warn: config.warn,
  error: config.error
};

var forcaster = new forecast({
  service: 'forecast.io',
  key: '3edd9fe60b9ffe8a69c5c2fe9fd4b479',
  cache: true,      
  ttl: {            // Results are cached for this long. 
    minutes: 60,
    seconds: 00
    }
});


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
app.post('/users', function(req, res) {
	console.log(req);
	new models.User(req.body)
	.save()
	.then(function (user) {
		res.json({error: false, data: {id: user.get('id')}});
	})
	.otherwise(function (err) {
		console.log(err);
		res.status(500).json({error: true, data: {message: err.message}});
	});
})

app.get('/users', function(req, res) {
  new models.User().fetchAll()
    .then(function (users) {
      res.send(users.toJSON());
    }).catch(function (error) {
      console.log(error);
      res.send('An error occured');
    });
})

app.get('/users/:userId', function(req, res) {
  new models.User({userid: 1})
    .fetch()
    .then(function (user) {
      res.send(user.toJSON());
    }).catch(function (error) {
      console.log(error);
      res.send('An error occured');
    });
})

app.post('/smells', function(req, res) {
  var addSmell = new models.Smell(req.body);

  addSmell.attributes.date = new Date();

  forcaster.get([addSmell.attributes.latitude, addSmell.attributes.longitude], function(err, weather) {
    if(err) {
      logger.error(err);
    }
    addSmell.attributes.windspeed = weather.currently.windSpeed;
    addSmell.attributes.winddirection = weather.currently.windBearing;

    addSmell.save()
    .then(function (smell) {
		res.json({error: false, data: {id: smell.get('id')}});
	})
	.otherwise(function (err) {
		console.log(err);
		res.status(500).json({error: true, data: {message: err.message}});
	});
  })
})

app.get('/smells', function(req, res) {
  new models.Smell().fetchAll()
    .then(function (smells) {
      res.send(smells.toJSON());
    }).catch(function (error) {
      console.log(error);
      res.send('An error occured');
    });
})

app.get('/smells/:id', function(req, res) {
  new models.Smell({id: req.params.id})
    .fetch()
    .then(function (smell) {
      res.send(smell.toJSON());
    }).catch(function (error) {
      console.log(error);
      res.send('An error occured');
    });
})

app.post('/comments', function(req, res) {
	new models.Comment(req.body)
	.save()
	.then(function (comment) {
		res.json({error: false, data: {id: comment.get('id')}});
	})
	.otherwise(function (err) {
		console.log(err);
		res.status(500).json({error: true, data: {message: err.message}});
	});
})

app.get('/comments', function(req, res) {
  new models.Comment().fetchAll()
    .then(function (comments) {
      res.send(comments.toJSON());
    }).catch(function (error) {
      console.log(error);
      res.send('An error occured');
    });
})

app.get('/comments/:smellId', function(req, res) {
  new models.Comment()
    .query({where: {smellid: req.params.smellId}})
    .fetchAll()
    .then(function (comments) {
      res.send(comments.toJSON());
    }).catch (function (error) {
      console.log(error);
      res.send('An error occured');
    });
})

app.get('/walks', function(req,res) {
  new models.Walk().fetchAll()
    .then(function (walks) {
      res.send(walks.toJSON());
    }).catch(function (error) {
      console.log(error);
      res.send('An error occured');
    });
})

app.get('/walks/:walkId', function(req, res) {
  new models.Walk({id: req.params.walkId})
    .fetch()
    .then(function (walk) {	
      res.send(walk.toJSON());
    }).catch(function (error) {
      console.log(error);
      res.send('An error occured');
   });
})

app.get('/points/:walkId', function(req, res) {
  new models.Point()
    .query({where: {walkid: req.params.walkId}})
    .fetchAll()
    .then(function (walks) {
      res.send(walks.toJSON());
    }).catch (function (error) {
      console.log(error);
      res.send('An error occured');
    });
})

/////// SERVER START /////// 
app.use(express.static(__dirname + "/www"));
app.listen(process.env.PORT || 5000);

app.listen(function() {
  console.log("Smellscape app is running!");
});