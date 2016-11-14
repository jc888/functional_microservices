const express = require('express');
const cors = require('cors');
const app = express();
const handlers = require('./handlers');
app.use(cors());

app.get('/', function(req, res) {
    handlers.search(req.query)
        .fork(
            err => res.status(err.status || 500).send(err.message),
            r => res.json(r)
        )
});

module.exports = app;
