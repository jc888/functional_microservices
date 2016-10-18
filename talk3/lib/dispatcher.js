const R = require('ramda');
const { memoize, map, pipe, curry, tap, chain, has } = require('ramda');
const { Future } = require('ramda-fantasy');
const RSMQWorker = require("rsmq-worker");

const createWorker = queue => {
    var worker = new RSMQWorker(queue, {
        interval: [0, 0.1],
        defaultDelay: 0,
        autostart: false
    });

    var onReady = Future((reject, resolve) => worker.on('ready', resolve))
        .map(tap((val) => console.log('listening on queue : ', queue)));

    worker.onReady = Future.cache(onReady);
    return worker;
}

const workerPool = (pool, queue) => {
    var worker = pool[queue] = (has(queue, pool)) ? pool[queue] : createWorker(queue);
    return worker;
}

const getWorker = curry(workerPool)({});

const queueSend = (queue, data) =>
    Future((reject, resolve) => getWorker(queue).send(data, null, (err, result) => err ? reject(err) : resolve(result)))
    .map(() => data);

const dispatcher = (queue, message) => pipe(
    () => getWorker(queue).onReady,
    map(() => message),
    map(JSON.stringify),
    map(tap((val) => console.log('dispatching on : ', queue))),
    chain(data => queueSend(queue, data)),
    map(() => message)
)();

module.exports = curry(dispatcher);
