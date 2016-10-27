// @flow
const { Future } = require('ramda-fantasy');
const elasticsearch = require('elasticsearch');

const elasticsearchConf = {
    host: 'localhost:9200',
    log: 'error'
};
const elasticsearchClient = new elasticsearch.Client(elasticsearchConf);
module.exports = query => Future((reject, resolve) => elasticsearchClient.search(query).then(resolve, reject));
