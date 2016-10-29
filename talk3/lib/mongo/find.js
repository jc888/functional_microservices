const { curry } = require('ramda');
const { Future } = require('ramda-fantasy');
const execute = require('./execute');
const futureFromPromise = require('../futureFromPromise');

const findArray = curry((query, collection) => futureFromPromise(() => collection.find(query).toArray()));

const find = curry((conf, collectionName, query) => execute(conf, collectionName, findArray(query)));

module.exports = find;
