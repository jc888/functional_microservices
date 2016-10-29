const { addIndex, assoc, memoize, equals, curry, merge, objOf, ifElse, compose, map, tap, chain, assocPath, prop, path, reduce } = require('ramda');
const { Future } = require('ramda-fantasy');

var demoSpeakers = [{
    name: "james",
    surname: "chow",
    title: "devops"
}, {
    name: "steffano",
    surname: "vozza",
    title: "developer"
}, {
    name: "andreas",
    surname: "moller",
    title: "developer"
}];

var demoTalks = [{
    title: "functional for the win",
    description: "the basic building blocks of functional programming",
    speaker: "andreas"
}, {
    title: "Papas brand new functional bag",
    description: "And why null can't hurt you",
    speaker: "steffano"
}, {
    title: "Microservices and how functional can help",
    description: "I couldn't come up with a witty description",
    speaker: "james"
}]

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/function_microservices';

var connect = url => Future((reject, resolve) => MongoClient.connect(url, (err, db) => err ? reject(err) : resolve(db)))
var collectionFromDb = curry((collectionName, db) => db.collection(collectionName));
var mongoCollection = (url, collectionName) => compose(map(collectionFromDb(collectionName)), connect)(url);
var removeCollection = curry((query, collection) => Future((reject, resolve) => collection.remove(query, (err, result) => err ? reject(err) : resolve(result))));
var insertCollection = curry((values, collection) => Future((reject, resolve) => collection.insert(values, {}, (err, result) => err ? reject(err) : resolve(result))));

var remove = curry((url, collectionName, query) => compose(
    chain(removeCollection(query)),
    () => mongoCollection(url, collectionName)
)())

var insert = curry((url, collectionName, values) => compose(
    chain(insertCollection(values)),
    () => mongoCollection(url, collectionName)
)())

var removeSpeakers = remove(url, 'speakers');
var insertSpeakers = insert(url, 'speakers');

var elasticsearch = require('elasticsearch');
var elasticsearchClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

var createES = query => Future((reject, resolve) => elasticsearchClient.create(query).then(resolve, reject));
var deleteES = query => Future((reject, resolve) => elasticsearchClient.delete(query).then(resolve, reject));
var existsES = query => Future((reject, resolve) => elasticsearchClient.exists(query).then(resolve, reject));

var upsert = query => {
    var exists = () => existsES(query);
    var create = () => createES(query);
    var remove = () => deleteES(query);
    var removeIfExists = ifElse(equals(true), remove, Future.of);

    return compose(
        chain(create),
        chain(removeIfExists),
        exists
    )()
}

var elasticSearchDocumentify = (index, type) => compose(
    map(assoc('index', index)),
    map(assoc('type', type)),
    addIndex(map)((val, idx) => assoc('id', idx, val)),
    map(objOf('body'))
)

module.exports = compose(
    map(tap(v => console.log('mongo seed complete'))),
    chain(() => insertSpeakers(demoSpeakers)),
    chain(() => removeSpeakers({})),
    map(tap(v => console.log('elasticsearch seed complete'))),
    reduce((acc, entry) => acc.chain(() => upsert(entry)), Future.of()),
    elasticSearchDocumentify('function_microservices', 'function_microservices')
)(demoTalks);
