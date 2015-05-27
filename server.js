var pg = require('pg');
var fs = require('fs');
var express = require('express');
var http = require('http');
var config = require('./server/config');
var knex = require('knex')(config.knex_options);
var bookshelf = require('bookshelf')(knex);
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var models = require('./server/models')(bookshelf);
var categorising = require('./server/categorising');
var url = require('url');
var forecast = require('forecast');
var aws = require('aws-sdk');

/////// APP SETUP ///////
var app = express();

// Logging 
var logger = {
  debug: config.debug,
  warn: config.warn,
  error: config.error
};

var forcaster = new forecast({
  service: 'forecast.io',
  key: '4faa3fc6e60fa0700fa5e36bcadb1a00',
  cache: true,      
  ttl: {            // Results are cached for this long. 
    minutes: 60,
    seconds: 0
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
	new models.User(req.body)
	.save()
	.then(function (user) {
		res.json({error: false, data: {id: user.get('id')}});
	})
	.otherwise(function (err) {
    logger.error(err);
		res.status(500).json({error: true, data: {message: err.message}});
	});
});

app.get('/users', function(req, res) {
  new models.User().fetchAll()
    .then(function (users) {
      res.send(users.toJSON());
    }).catch(function (error) {
      logger.error(error);
      res.send('An error occured');
    });
});

app.post('/smells', function(req, res) {
  var addSmell = new models.Smell(req.body);

  // Store images in S3 and adds path to database. 
  if(addSmell.attributes.visualisation !== "") {
    var s3 = new aws.S3();
    var s3_params = {
      Bucket: config.awskeys.S3_BUCKET,
      Key: addSmell.attributes.visualisation,
      Expires: 60,
      ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            addSmell.attributes.visualisation = 'https://'+config.awskeys.S3_BUCKET+'.s3.amazonaws.com/'+s3_params.Key;
        }
    });
  }

  addSmell.attributes.date = new Date();

  var category = categorising.assignCategory(addSmell.attributes.description);
  addSmell.attributes.categoryid = category;

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
		logger.error(err);
		res.status(500).json({error: true, data: {message: err.message}});
	});
  });
});

app.get('/smells', function(req, res) {
  new models.Smell().fetchAll()
    .then(function (smells) {
      res.send(smells.toJSON());
    }).catch(function (error) {
      logger.error(error);
      res.send('An error occured');
    });
});

app.get('/smells/:id', function(req, res) {
  new models.Smell({id: req.params.id})
    .fetch()
    .then(function (smell) {
      res.send(smell.toJSON());
    }).catch(function (error) {
      logger.error(error);
      res.send('An error occured');
    });
});

app.post('/comments', function(req, res) {
	new models.Comment(req.body)
	.save()
	.then(function (comment) {
		res.json({error: false, data: {id: comment.get('id')}});
	})
	.otherwise(function (err) {
		logger.error(err);
		res.status(500).json({error: true, data: {message: err.message}});
	});
});

app.get('/comments', function(req, res) {
  new models.Comment().fetchAll()
    .then(function (comments) {
      res.send(comments.toJSON());
    }).catch(function (error) {
      logger.error(error);
      res.send('An error occured');
    });
});

app.get('/comments/:smellId', function(req, res) {
  var emptyString = '';
  new models.Comment()
    .query(function(qb) {
      qb.where('smellid', req.params.smellId).andWhere('body', '<>', emptyString);
    })
    .fetchAll()
    .then(function (comments) {
      res.send(comments.toJSON());
    }).catch (function (error) {
      logger.error(error);
      res.send('An error occured');
    });
});

app.get('/walks', function(req,res) {
  new models.Walk().fetchAll()
    .then(function (walks) {
      res.send(walks.toJSON());
    }).catch(function (error) {
      logger.error(error);
      res.send('An error occured');
    });
});

app.get('/walks/:walkId', function(req, res) {
  new models.Walk({id: req.params.walkId})
    .fetch()
    .then(function (walk) {	
      res.send(walk.toJSON());
    }).catch(function (error) {
      logger.error(error);
      res.send('An error occured');
   });
});

app.get('/points/:walkId', function(req, res) {
  new models.Point()
    .query(function(qb) {
      qb.where({walkid: req.params.walkId});
      qb.orderBy('sequence', 'ASC');
    })
    .fetchAll()
    .then(function (walks) {
      res.send(walks.toJSON());
    }).catch (function (error) {
      logger.error(error);
      res.send('An error occured');
    });
});

/////// SERVER START /////// 
app.use(express.static(__dirname + "/www"));
app.listen(process.env.PORT || 5000);

app.listen(function() {
  logger.debug("Smellscape app is running!");
});