const R = require('ramda');
const { map, compose, pipe, curry, tap, chain, always } = require('ramda');
const { Future } = require('ramda-fantasy');
const RSMQWorker = require("rsmq-worker");

const worker = new RSMQWorker("worker", {
    autostart: false
});

const onWorkerReady = (worker, data) =>
    Future((reject, resolve) => worker.on('ready', () => resolve(data)));

const workerSend = (worker, data) =>
    Future((reject, resolve) => worker.send(data, null, (err, data) => err ? reject(err) : resolve(data)));

const onReady = curry(onWorkerReady)(worker);
const send = curry(workerSend)(worker);

const sendPayload = pipe(
    onReady,
    map(JSON.stringify),
    chain(send)
);

sendPayload({
    type: "blah"
}).fork(() => {}, () => {})

worker.on("message", function(msg, next, id) {
    console.log("RECEIVED", msg, id);
    next();
});
