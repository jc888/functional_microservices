const elasticsearch = require('elasticsearch');
const { clone } = require('ramda');

const elasticSearchClient = conf => () => new elasticsearch.Client(clone(conf));

module.exports = elasticSearchClient;
