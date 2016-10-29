const { curry } = require('ramda');
const { Future } = require('ramda-fantasy');
const execute = require('./execute');

const findOne = curry((query, collection) => Future((reject, resolve) => collection.findOne(query, {}, (err, result) => err ? reject(err) : resolve(result))));

const find = curry((conf, collectionName, query) => execute(conf, collectionName, findOne(query)));

module.exports = find;

