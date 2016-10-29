const { curry } = require('ramda');
const { Future } = require('ramda-fantasy');
const execute = require('./execute');

const findArray = curry((query, collection) => Future((reject, resolve) => collection.find(query).toArray((err, result) => err ? reject(err) : resolve(result))));

const find = curry((conf, collectionName, query) => execute(conf, collectionName, findArray(query)));

module.exports = find;
