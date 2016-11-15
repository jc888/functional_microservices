const { curry } = require('ramda');
const execute = require('./execute');
const futureFromPromise = require('../futureFromPromise');

// invokeMethod :: String -> Query -> Collection -> Future e Result
const invokeMethod = curry((method, query, collection) => futureFromPromise(() => collection[method](query)));

// futurizeMethod :: String -> Conf -> String -> Query -> Future e Result
const futurizeMethod = curry((method, conf, collectionName, query) => execute(conf, collectionName, invokeMethod(method, query)));

module.exports = futurizeMethod;
