const { curry } = require('ramda');
const { Future } = require('ramda-fantasy');
const execute = require('./execute');
const futureFromPromise = require('../futureFromPromise');

const invokeMethod = curry((method, query, collection) => futureFromPromise(() => collection[method](query)));

// futurizeMethod :: String -> conf -> String -> query -> Future e a
const futurizeMethod = curry((method, conf, collectionName, query) => execute(conf, collectionName, invokeMethod(method, query)));

module.exports = futurizeMethod;
