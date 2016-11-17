const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const request = require('request-json');
const client = request.createClient('http://localhost:8080/');
const { curry, compose, chain, map } = require('ramda');
const Future = require('fluture');
const logger = require('./lib/logger');
const services = require('./handlers').services;

app.use(cors());
app.use(bodyParser.json());

app.post('/findTalks', function(req, res) {
    services.findTalks(req.body)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.json(r)
        )
});

app.post('/findSpeakersWithTalks', function(req, res) {
    services.findSpeakersWithTalks(req.body)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.json(r)
        )
});

app.post('/joinSpeakersWithTalks', function(req, res) {
    Future.of(services.joinSpeakersWithTalks(req.body))
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.json(r)
        )
});

app.get('/', function(req, res) {
    compose(
        chain(requestWithBody('joinSpeakersWithTalks')),
        chain(requestWithBody('findSpeakersWithTalks')),
        requestWithBody('findTalks')
    )(req.query).fork(
        err => res.status(err.status || 500).send(err.message),
        r => res.json(r)
    )
});

var requestWithBody = curry((path, data) => Future((reject, resolve) => {
    client.post(path, data, function(err, response, body) {
        (err) ? reject(err): resolve(body);
    });
}));

app.listen(8080, () => console.log('server started port 8080'));

module.exports = app;
