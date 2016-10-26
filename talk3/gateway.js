const { memoize, map, pipe, curry, tap, chain, has } = require('ramda');
var express = require('express');
var app = express();
const dispatcher = require('./lib/dispatcher');
const seeder = require('./seeder');
const worker = require('./worker');
const broker = require('./broker');
const uuid = require('uuid');

app.get('/:name', function(req, res) {

    var correlationId = uuid.v4();

    dispatcher('worker')({
        correlationId: correlationId,
    }).fork(() => {}, () => {});

    broker.once(correlationId, res.json.bind(res))
});

module.exports = app;
