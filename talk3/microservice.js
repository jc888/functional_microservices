const { memoize, map, pipe, curry, tap, chain, has } = require('ramda');
var express = require('express');
var app = express();
var searchHandler = require('./searchHandler');
var seeder = require('./seeder2');

app.get('/', function(req, res) {
    searchHandler(req.query)
        .fork(
            err => res.status(502).send(err),
            v => res.json(v)
        );
});

module.exports = app;
