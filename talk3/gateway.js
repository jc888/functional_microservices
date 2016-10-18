const { memoize, map, pipe, curry, tap, chain, has } = require('ramda');
var express = require('express');
var app = express();
const dispatcher = require('./lib/dispatcher');
const broker = require('./broker');
const mongofn = require('./lib/mongofn');
const uuid = require('uuid');

pipe(
    () => mongofn.drop(mongofn.url, 'users', null)
)().fork(console.log, console.log);

app.get('/:name', function(req, res) {

    var correlationId = uuid.v4();

    dispatcher('worker')({
        correlationId: correlationId,
        user: {
            id: "12345"
        }
    }).fork(() => {}, () => {});

    broker.once(correlationId, res.json.bind(res))
});

module.exports = app;
