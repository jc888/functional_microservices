var request = require('supertest');
var app = require('../search');
var seeder = require('../harvest');

describe('GET /', function() {
    this.timeout(20000);
    before(done => seeder.fork(done, () => done()));
    it('respond with json', function(done) {
        request(app)
            .get('/')
            .query({ q: 'functional' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
                console.log('Test case response : ', res.body);
                if (err) return done(err);
                done();
            })
    });
});
