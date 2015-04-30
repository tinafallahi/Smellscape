var chai = require('chai'),
	should = chai.should(),
	assert = chai.assert,
    supertest = require('supertest'),
    api = supertest('http://localhost:5000');

	chai.use(require('chai-json-schema'));

var userSchema = {
	"userid": "number", 
	"name": "string", 
	"email": "string",
	"profilepicture": "string",
	"settingsid": "number"
};

var smellSchema = {
  "userid": "number", 
  "description": "string", 
  "strength": "number",
  "likeability": "number",
  "dynamicness": "number",
  "association": "string",
  "visualisation": "string",
  "longitude": "number",
  "latitude": "number",
  "date": "datetime",
  "id": "number",
  "categoryid": "string",
  "expected": "boolean",
  "windspeed": "number",
  "winddirection": "number"
};

var commentSchema = {
  "userid": "number", 
  "agree": "boolean", 
  "body": "string",
  "smellid": "number",
  "id": "number"
};

var walkSchema = {
  "id": "number", 
  "name": "string", 
  "description": "string",
  "userid": "number"
};

var pointSchema = {
  "id": "number", 
  "walkid": "number", 
  "latitude": "number",
  "longitude": "number",
  "sequence": "number"
};

describe('/users', function() {

  it('returns all users as JSON', function(done) {
    api.get('/users')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      res.body.should.be.instanceof(Array);
      assert.jsonSchema(res.body, userSchema);
      done();
    });
  });

  it('adds a user', function(done) {
    api.post('/users')
    .set('Accept', 'application/x-www-form-urlencoded')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        assert.fail();
        return done(err);
      }
      done();
    });
  });

});

describe('/smells', function() {
  this.timeout(15000);
  it('returns all smells as JSON', function(done) {
    this.timeout(15000);
    setTimeout(done, 15000);
    api.get('/smells')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      res.body.should.be.instanceof(Array);
      assert.jsonSchema(res.body, smellSchema);
      done();
    });
  });

  it('returns smells for id as JSON', function(done) {
    this.timeout(15000);
    setTimeout(done, 15000);
    api.get('/smells/1')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      assert.jsonSchema(res.body, smellSchema);
      done();
    });
  });

  it('adds a smell', function(done) {
    var smell = {description: "car fuels", 
                 longitude: 51.5072,
                 latitude: -0.1275 };
    api.post('/smells')
    .set('accept', 'application/json, text/plain, */*')
    .set('content-type', 'application/json;charset=UTF-8')
    .send(smell)
    .expect(200)
    .end(function(err, res) {
      if (err) {
        assert.fail();
        return done(err);
      }
      //assert.equals(res.body.categoryid, "SMTH");
      done();
    });
  });

});

describe('/comments', function() {
  this.timeout(15000);
  it('returns all comments as JSON', function(done) {
    this.timeout(15000);
    setTimeout(done, 15000);
    api.get('/comments')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      res.body.should.be.instanceof(Array);
      assert.jsonSchema(res.body, commentSchema);
      done();
    });
  });

  it('returns comments for smellid as JSON', function(done) {
    this.timeout(15000);
    setTimeout(done, 15000);
    api.get('/comments/1')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      assert.jsonSchema(res.body, commentSchema);
      done();
    });
  });

  it('adds a comment', function(done) {
    api.post('/comments')
    .set('Accept', 'application/x-www-form-urlencoded')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        assert.fail();
        return done(err);
      }
      done();
    });
  });

});

describe('/points/1', function() {

  it('returns points for a walkid as JSON', function(done) {
    api.get('/points/1')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      res.body.should.be.instanceof(Array);
      assert.jsonSchema(res.body, pointSchema);
      done();
    });
  });

});

describe('/walks/1', function() {

  it('returns walks for a walkid as JSON', function(done) {
    api.get('/walks/1')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      assert.jsonSchema(res.body, walkSchema);
      done();
    });
  });

  it('returns all walks as JSON', function(done) {
    api.get('/walks')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      res.body.should.be.instanceof(Array);
      assert.jsonSchema(res.body, walkSchema);
      done();
    });
  });

});