const express = require('express');
const app = express();
const searchHandler = require('./searchHandler');

app.get('/', function(req, res) {
    searchHandler(req.query)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.send(r)
        )
});

module.exports = app;
