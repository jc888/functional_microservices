const client = require('./client');
const futureFromPromise = require('../futureFromPromise');
const { curry } = require('ramda');

// futurizeMethod :: String -> Conf -> Query -> Future e Result
const futurizeMethod = curry((method, conf, query) =>  futureFromPromise(() => client(conf)[method](query)));

module.exports = futurizeMethod;
