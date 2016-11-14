const { curry } = require('ramda');
const execute = require('./execute');
const futureFromPromise = require('../futureFromPromise');

// findArray :: query -> collection -> Future e a
const findArray = curry((query, collection) => futureFromPromise(() => collection.find(query).toArray()));

// find :: conf -> String -> query -> Future e a
const find = curry((conf, collectionName, query) => execute(conf, collectionName, findArray(query)));

module.exports = find;
