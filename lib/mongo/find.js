const { curry } = require('ramda');
const execute = require('./execute');
const futureFromPromise = require('../futureFromPromise');

// findArray :: Query -> Collection -> Future e Result
const findArray = curry((query, collection) => futureFromPromise(() => collection.find(query).toArray()));

// find :: conf -> String -> Query -> Future e Result
const find = curry((conf, collectionName, query) => execute(conf, collectionName, findArray(query)));

module.exports = find;
