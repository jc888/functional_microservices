const R = require('ramda');
const { memoize, map, compose, zip, fromPairs, pipe, nth, curry, tap, chain, unapply, always, juxt, mergeAll, identity, prop, objOf, assoc, converge, construct } = require('ramda');
const { Future } = require('ramda-fantasy');

const RSMQWorker = require("rsmq-worker");

const workerFactory = memoize(queue => new RSMQWorker(queue, {
    interval: [0, 0.1],
    defaultDelay:0,
    autostart: true
}))

const parse = pipe(
    prop('msg'),
    JSON.parse,
    objOf('parsed')
)

const process = pipe(
    zip(['msg', 'next', 'id']),
    fromPairs,
    juxt([identity, parse]),
    mergeAll
)

const sourceAfterAction = (val) => Future.of(() => val[0]).ap(val[1]);

const messagehandler = unapply(process);

const reciever = (queue, fn) => {

    var handler = pipe(
        messagehandler,
        juxt([identity, fn]),
        sourceAfterAction,
        //map(tap(console.log)),
        map(tap(val => val.next())),
        fut => fut.fork(() => {}, () => {})
    );

    //console.log('attaching reciever');
    var worker = workerFactory(queue);
    worker.on('message', handler);
}

module.exports = reciever;
