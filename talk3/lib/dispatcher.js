const R = require('ramda');
const { memoize, map, pipe, curry, tap, chain } = require('ramda');
const { Future } = require('ramda-fantasy');
const RSMQWorker = require("rsmq-worker");

const workerfactory = memoize(queue => new RSMQWorker(queue, {
    interval: [0, 0.1],
    defaultDelay: 0,
    autostart: false
}));

const queueReady = memoize((queue) =>
    Future((reject, resolve) => workerfactory(queue).on('ready', resolve))
    .map(tap((val) => console.log('listening on queue : ', queue)))
);

const queueReadyCached = memoize((queue) => Future.cache(queueReady(queue)));

const queueSend = (queue, data) =>
    Future((reject, resolve) => workerfactory(queue).send(data, null, (err, data) => err ? reject(err) : resolve(data)));

const send = curry(queueSend);

const dispatcher = (queue, message) => pipe(
    () => queueReadyCached(queue),
    map(() => message),
    map(JSON.stringify),
    map(tap((val) => console.log('dispatching on : ', queue))),
    chain(send(queue)),
    map(() => message)
)();

module.exports = curry(dispatcher);
