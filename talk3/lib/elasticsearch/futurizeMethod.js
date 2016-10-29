const client = require('./client');
const { curry } = require('ramda');
const { Future } = require('ramda-fantasy');

const invokeMethodOnClient = curry((method, clientFn, query) => Future((reject, resolve) => clientFn()[method](query).then(resolve, reject)));
const futurizeMethod = curry((method, conf, query) => invokeMethodOnClient(method, client(conf), query));

module.exports = futurizeMethod;
