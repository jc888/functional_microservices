var express = require('express');
var app = express();
var searchHandler = require('./searchHandler');

app.get('/', function(req, res) {
    searchHandler(req.query)
        .fork(
            err => res.status(502).send(err),
            v => res.json(v)
        );
});

module.exports = app;
