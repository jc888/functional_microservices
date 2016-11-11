const { addIndex, assoc, compose, map, tap, chain } = require('ramda');
const Future = require('Fluture');
const logger = require('../lib/logger');

var mongo = require('../mongo');
var elasticsearch = require('../elasticsearch');

// elasticSearchDocumentify :: (index, type) -> [a] -> [b]
var elasticSearchDocumentify = (index, type) => compose(
    map(assoc('index', index)),
    map(assoc('type', type)),
    addIndex(map)((val, idx) => assoc('id', idx, val)),
    map(v => ({ body: v }))
)

// delay :: time -> v -> Future a v
var delay = time => v => Future((reject, resolve) => setTimeout(() => resolve(v), time));

// seedElasticSearch :: () -> Future e a
var seedElasticSearch = compose(
    map(tap(v => console.log('elasticsearch seed complete'))),
    Future.parallel(1),
    map(elasticsearch.upsert),
    elasticSearchDocumentify('function_microservices', 'function_microservices'),
    () => require('./data/talks.json')
);

// seedMongo :: () -> Future e a
var seedMongo = compose(
    map(tap(v => console.log('mongo seed complete'))),
    chain(() => mongo.insert('speakers', require('./data/speakers.json'))),
    () => mongo.remove('speakers', {})
)

// seeder :: () -> Future e a
var seeder = compose(
    chain(delay(200)),
    chain(seedElasticSearch),
    seedMongo
);

module.exports = seeder;
