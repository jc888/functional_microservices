const client = require('./client');
const { curry } = require('ramda');
const { Future } = require('ramda-fantasy');

const searchWithClient = curry((clientFn, query) => Future((reject, resolve) => clientFn().search(query).then(resolve, reject)));
const find = curry((conf, query) => searchWithClient(client(conf), query));

module.exports = find;
