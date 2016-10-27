const elasticsearch = require('elasticsearch');
const { curry, compose, clone } = require('ramda');
const { Future } = require('ramda-fantasy');

const searchWithClient = curry((clientFn, query) => Future((reject, resolve) => clientFn().search(query).then(resolve, reject)));
const getClient = conf => () => new elasticsearch.Client(clone(conf));
const find = curry((conf, query) => searchWithClient(getClient(conf), query));

module.exports = find;
