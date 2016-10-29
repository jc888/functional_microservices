const { curry } = require('ramda');
const { Future } = require('ramda-fantasy');
const execute = require('./execute');

const invokeMethod = curry((method, query, collection) => Future((reject, resolve) => collection[method](query, (err, result) => err ? reject(err) : resolve(result))));

const futurizeMethod = curry((method, conf, collectionName, query) => execute(conf, collectionName, invokeMethod(method, query)));

module.exports = futurizeMethod;
