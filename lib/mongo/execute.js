const { ap, of, sequence, chain, curry, map, compose } = require('ramda');
const { Future } = require('ramda-fantasy');
const { MongoClient } = require('mongodb');
const futureFromPromise = require('../futureFromPromise');
const logger = require('../logger');

// mongoConnect :: conf -> client
const mongoConnect = conf => futureFromPromise(() => MongoClient.connect(conf.url));

// mongoConnect :: collectionName -> db -> collection
const collectionFromDb = curry((collectionName, db) => db.collection(collectionName));

// mongoConnect :: ( collectionName, ( () -> Future e a ) ) -> Future e b
const invokeAsyncOperationAgainstCollection = (collectionName, asyncOperation) => compose(asyncOperation, collectionFromDb(collectionName));

// closeAfterResult :: [a,b] -> a
const closeAfterResult = ([result, db]) => {
    db.close();
    return result;
};

// execute :: conf -> collectionName -> ( () -> Future e a ) ->  Future e b
const execute = curry((conf, collectionName, asyncOperation) => compose(
    map(closeAfterResult),
    chain(sequence(Future.of)),
    map(ap([invokeAsyncOperationAgainstCollection(collectionName, asyncOperation), Future.of])),
    map(of),
    mongoConnect
)(conf));

module.exports = execute;
