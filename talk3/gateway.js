var express = require('express');
var app = express();
const dispatcher = require('./lib/dispatcher');
const broker = require('./broker');
const uuid = require('uuid');

app.get('/:name', function(req, res) {

    var correlationId = uuid.v4();

    dispatcher('user')({
        correlationId: correlationId,
        user: {
            id: "12345"
        }
    }).fork(() => {}, () => {});

    broker.once(correlationId, res.json.bind(res))
});

module.exports = app;
