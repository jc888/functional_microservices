const { memoize, map, pipe, curry, tap, chain, has } = require('ramda');
var express = require('express');
var app = express();
const dispatcher = require('./lib/messaging/dispatcher');
const workers = require('./workers');
const broker = require('./broker');
const uuid = require('uuid');

app.get('/', function(req, res) {

    var correlationId = uuid.v4();

    dispatcher('elasticsearch')({
        correlationId: correlationId,
        payload: req.query
    }).fork(() => {}, () => {});

    broker.once(correlationId, res.json.bind(res))
});

module.exports = app;
