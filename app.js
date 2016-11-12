const express = require('express');
const app = express();
const handlers = require('./handlers');

app.get('/', function(req, res) {
    handlers.search(req.query)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.json(r)
        )
});

module.exports = app;
