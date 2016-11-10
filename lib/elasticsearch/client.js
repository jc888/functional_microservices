const elasticsearch = require('elasticsearch');
const { clone, memoize } = require('ramda');

const client = memoize(conf => new elasticsearch.Client(clone(conf)));

module.exports = client;
