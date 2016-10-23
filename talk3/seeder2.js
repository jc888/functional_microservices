const { memoize, equals, curry, merge, objOf, ifElse, compose, map, tap, chain, assocPath, prop, path, reduce } = require('ramda');
const { Future } = require('ramda-fantasy');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/function_microservices';

var dbConnect = url => Future((reject, resolve) => MongoClient.connect(url, (err, db) => err ? reject(err) : resolve(db)))
var dbCollection = curry((collection, db) => db.collection(collection));
var getCollection = (url, collection) => compose(map(dbCollection(collection)), dbConnect)(url);
var removeCollection = curry((query, collection) => Future((reject, resolve) => collection.remove(query, (err, result) => err ? reject(err) : resolve(result))));
var insertCollection = curry((values, collection) => Future((reject, resolve) => collection.insert(values, {}, (err, result) => err ? reject(err) : resolve(result))));

var remove = curry((url, collection, query) => compose(
    chain(removeCollection(query)),
    () => getCollection(url, collection)
)())

var insert = curry((url, collection, values) => compose(
    chain(insertCollection(values)),
    () => getCollection(url, collection)
)())

var removeUsers = remove(url, 'users');
var insertUsers = insert(url, 'users');
var demoUsers = [{
    name: "james",
    surname: "chow"
}, {
    name: "steffano",
    surname: "vozza"
}, {
    name: "andreas",
    surname: "moller"
}];

compose(
    map(tap(v => console.log('mongo seed complete'))),
    chain(insertUsers),
    map(() => demoUsers),
    removeUsers
)({}).fork(console.log, () => {});


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

var entries = [{
    index: 'function_microservices',
    type: 'function_microservices',
    id: '1',
    body: {
        title: "functional for the win",
        name: "andreas"
    }
}, {
    index: 'function_microservices',
    type: 'function_microservices',
    id: '2',
    body: {
        title: "Papas brand new functional bag",
        name: "steffano"
    }
}, {
    index: 'function_microservices',
    type: 'function_microservices',
    id: '3',
    body: {
        title: "Microservices and how functional can help",
        name: "james"
    }
}]

compose(
    map(tap(v => console.log('elasticsearch seed complete'))),
    reduce((acc, entry) => acc.chain(() => upsert(entry)), Future.of())
)(entries).fork(console.log, () => {});
