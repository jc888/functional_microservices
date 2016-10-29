const { sequence, juxt, chain, curry, map, compose } = require('ramda');
const { Future } = require('ramda-fantasy');
const { MongoClient } = require('mongodb');

const mongoConnect = conf => Future((reject, resolve) => MongoClient.connect(conf.url, (err, db) => err ? reject(err) : resolve(db)));
const collectionFromDb = curry((collectionName, db) => db.collection(collectionName));
const invokeAsyncOperationAgainstCollection = (collectionName, fn) => compose(fn, collectionFromDb(collectionName));

const closeAfterResult = ([result, db]) => {
    db.close()
    return result;
};

const execute = curry((conf, collectionName, asyncOperation) => compose(
    map(closeAfterResult),
    chain(sequence(Future.of)),
    map(juxt([invokeAsyncOperationAgainstCollection(collectionName, asyncOperation), Future.of])),
    mongoConnect
)(conf));

module.exports = execute;
