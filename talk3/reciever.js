const R = require('ramda');
const { partial, memoize, map, compose, zip, fromPairs, pipe, nth, curry, tap, chain, unapply, always, juxt, mergeAll, identity, prop, objOf, assoc, converge, construct } = require('ramda');
const { Future } = require('ramda-fantasy');

const RSMQWorker = require("rsmq-worker");

const workerFactory = memoize(queue => new RSMQWorker(queue, {
    interval: [0, 0.1],
    defaultDelay: 0,
    autostart: true
}))

const parse = pipe(
    prop('msg'),
    JSON.parse,
    objOf('parsed')
)

const objectifyMessageCallback = pipe(
    zip(['msg', 'next', 'id']),
    fromPairs,
    juxt([identity, parse]),
    mergeAll
)

const sourceAfterAfterAction = (val) => Future.of(() => val[0]).ap(val[1]);

const createMessageHandler = asyncActionFn => pipe(
    unapply(objectifyMessageCallback),
    juxt([identity, asyncActionFn]),
    sourceAfterAfterAction,
    //map(tap(console.log)),
    map(tap(val => val.next())),
    fut => fut.fork(() => {}, () => {})
);

/**
Given a queue name, and a callback function which returns a future
**/
const reciever = (queue, asyncActionFn) => workerFactory(queue).on('message', createMessageHandler(asyncActionFn));

module.exports = reciever;
