const elasticSearchClient = require('./elasticSearchClient');
const { curry, clone } = require('ramda');
const { Future } = require('ramda-fantasy');

const searchWithClient = curry((clientFn, query) => Future((reject, resolve) => clientFn().search(query).then(resolve, reject)));
const elasticSearchFind = curry((conf, query) => searchWithClient(elasticSearchClient(conf), query));

module.exports = elasticSearchFind;
