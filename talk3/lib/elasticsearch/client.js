const elasticsearch = require('elasticsearch');
const { clone } = require('ramda');

const client = conf => () => new elasticsearch.Client(clone(conf));

module.exports = client;
