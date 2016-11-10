const { ap, of, sequence, chain, curry, map, compose } = require('ramda');
const { Future } = require('ramda-fantasy');
const { MongoClient } = require('mongodb');
const futureFromPromise = require('../futureFromPromise');
const logger = require('../logger');
const mongoConnect = conf => futureFromPromise(() => MongoClient.connect(conf.url));

const collectionFromDb = curry((collectionName, db) => db.collection(collectionName));

const invokeAsyncOperationAgainstCollection = (collectionName, asyncOperation) => compose(asyncOperation, collectionFromDb(collectionName));

const closeAfterResult = ([result, db]) => {
    db.close();
    return result;
};

const execute = curry((conf, collectionName, asyncOperation) => compose(
    map(closeAfterResult),
    chain(sequence(Future.of)),
    map(ap([invokeAsyncOperationAgainstCollection(collectionName, asyncOperation), Future.of])),
    map(of),
    mongoConnect
)(conf));

module.exports = execute;
