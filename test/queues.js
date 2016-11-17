var request = require('supertest');
var app = require('../gateway');

describe('GET /', function() {
    it('respond with json', function(done) {
        request(app)
            .get('/')
            .query({ q: 'functional' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                console.log('test recieved', res.body);
                if (err) return done(err);
                done();
            })
    });
});
