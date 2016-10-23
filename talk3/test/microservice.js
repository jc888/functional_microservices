var request = require('supertest');
var app = require('../microservice');

describe('GET /', function() {
  it('respond with json', function(done) {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err,res)=>{
      	console.log('Test case response : ',res.body);
       if (err) return done(err);
        done();
      })
  });
});