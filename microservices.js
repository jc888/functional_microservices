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

app.get('/findTalks', function(req, res) {
    services.findTalks(req.query)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.json(r)
        )
});

app.post('/findTalks', function(req, res) {
    services.findTalks(req.body)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.json(r)
        )
});

app.post('/addSpeakers', function(req, res) {
    services.addSpeakers(req.body)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.json(r)
        )
});

app.get('/', function(req, res) {
    compose(
        chain(requestWithBody('addSpeakers')),
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

app.listen(8080, () => console.log('microservices server started port 8080'));

module.exports = app;
