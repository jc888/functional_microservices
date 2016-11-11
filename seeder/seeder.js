const { addIndex, sequence, assoc, compose, map, tap, chain, objOf } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('../lib/logger');

const mongo = require('../mongo');

var elasticsearch = require('../elasticsearch');

var elasticSearchDocumentify = (index, type) => compose(
    map(assoc('index', index)),
    map(assoc('type', type)),
    addIndex(map)((val, idx) => assoc('id', idx, val)),
    map(objOf('body'))
)

var delay = time => v => Future((reject, resolve) => setTimeout(() => resolve(v), time));

module.exports = compose(
    chain(delay(200)),
    map(tap(v => console.log('mongo seed complete'))),
    chain(() => mongo.insert('speakers',require('./data/speakers.json'))),
    chain(() => mongo.remove('speakers',{})),
    map(tap(v => console.log('elasticsearch seed complete'))),
    sequence(Future.of),
    map(elasticsearch.upsert),
    elasticSearchDocumentify('function_microservices', 'function_microservices')
)(require('./data/talks.json'));
