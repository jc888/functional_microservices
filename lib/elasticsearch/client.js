const elasticsearch = require('elasticsearch');
const { clone, memoize } = require('ramda');

// client :: a -> b
const client = memoize(conf => new elasticsearch.Client(clone(conf)));

module.exports = client;
