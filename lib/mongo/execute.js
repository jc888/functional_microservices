const { chain, curry, map, compose } = require('ramda');
const Future = require('fluture');
const { MongoClient } = require('mongodb');
const futureFromPromise = require('../futureFromPromise');
const logger = require('../logger');

// mongoConnect :: Conf -> Client
const mongoConnect = conf => futureFromPromise(() => MongoClient.connect(conf.url));

// collectionFromDb :: String -> Db -> Collection
const collectionFromDb = curry((collectionName, db) => db.collection(collectionName));

// invokeAsyncOperationAgainstCollection :: ((Collection -> Future e Result), String, Db) -> Future e Result
const invokeAsyncOperationAgainstCollection = (asyncOperation, collectionName, db) => compose(
    asyncOperation,
    collectionFromDb(collectionName)
)(db);

// closeAfterResult :: [Result,Db] -> Result
const closeAfterResult = ([result, db]) => {
    db.close();
    return result;
};

// execute :: Conf -> String -> ( Collection -> Future e Result ) ->  Future e Result
const execute = curry((conf, collectionName, asyncOperation) => compose(
    map(closeAfterResult),
    chain(db => Future.parallel(5, [invokeAsyncOperationAgainstCollection(asyncOperation, collectionName, db), Future.of(db)])),
    mongoConnect
)(conf));

module.exports = execute;
