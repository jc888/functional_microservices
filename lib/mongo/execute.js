const { chain, curry, map, compose } = require('ramda');
const Future = require('fluture');
const { MongoClient } = require('mongodb');
const futureFromPromise = require('../futureFromPromise');
const logger = require('../logger');

// mongoConnect :: conf -> client
const mongoConnect = conf => futureFromPromise(() => MongoClient.connect(conf.url));

// collectionFromDb :: collectionName -> db -> collection
const collectionFromDb = curry((collectionName, db) => db.collection(collectionName));

// invokeAsyncOperationAgainstCollection :: ((collection -> Future e a), String, db) -> Future e b
const invokeAsyncOperationAgainstCollection = (asyncOperation, collectionName, db) => compose(
    asyncOperation,
    collectionFromDb(collectionName)
)(db);

// closeAfterResult :: [a,b] -> a
const closeAfterResult = ([result, db]) => {
    db.close();
    return result;
};

// execute :: conf -> String -> ( collection -> Future e a ) ->  Future e b
const execute = curry((conf, collectionName, asyncOperation) => compose(
    map(closeAfterResult),
    chain(db => Future.parallel(5, [invokeAsyncOperationAgainstCollection(asyncOperation, collectionName, db), Future.of(db)])),
    mongoConnect
)(conf));

module.exports = execute;
