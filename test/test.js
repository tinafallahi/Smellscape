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

describe('/api/users', function() {

  it('returns all users as JSON', function(done) {
    api.get('/api/users')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      res.body.should.be.instanceof(Array);
      assert.jsonSchema(res.body, userSchema);
      done();
    });
  });

});