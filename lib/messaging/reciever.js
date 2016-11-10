const { memoize, map, zip, fromPairs, pipe, tap, unapply, juxt, mergeAll, prop } = require('ramda');
const { Future } = require('ramda-fantasy');
const RSMQWorker = require("rsmq-worker");

const workerFactory = memoize(queue => new RSMQWorker(queue, {
    interval: [0, 0.1],
    defaultDelay: 0,
    autostart: true
}))

const pipeThroughAsyncActionFn = asyncActionFn => pipe(
    prop('msg'),
    JSON.parse,
    asyncActionFn
)

const objectifyMessageCallback = pipe(
    zip(['msg', 'next', 'id']),
    fromPairs,
    mergeAll
)

const sourceAfterAction = (val) => Future.of(() => val[0]).ap(val[1]);

const createMessageHandler = asyncActionFn => pipe(
    unapply(objectifyMessageCallback),
    juxt([x => x, pipeThroughAsyncActionFn(asyncActionFn)]),
    sourceAfterAction,
    map(tap(val => val.next())),
    fut => fut.fork(() => {}, () => {})
);

const reciever = (queue, asyncActionFn) => workerFactory(queue).on('message', createMessageHandler(asyncActionFn));

module.exports = reciever;
