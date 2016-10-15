const R = require('ramda');
const { map, compose, pipe, curry, tap, chain, always, juxt, mergeAll, identity, prop, objOf, assoc,converge } = require('ramda');
const { Future } = require('ramda-fantasy');
const RSMQWorker = require("rsmq-worker");

worker = new RSMQWorker("worker", {
    interval: .1,
    autostart: true
});

const strip = pipe(
	prop('msg'),
	JSON.parse
)

const process = pipe(
    tap(val => val.next()),
    juxt([identity,strip]),
    mergeAll,
    tap(console.log)
)

worker.on("message", function(msg, next, id) {
    process({
        msg: msg,
        next: next,
        id: id
    })
});
