//lets require/import the mongodb native drivers.
const { memoize, map, pipe, curry, tap, chain, has } = require('ramda');
const { Future } = require('ramda-fantasy');
const RSMQWorker = require("rsmq-worker");
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

var connect = url => Future((reject, resolve) => MongoClient.connect(url, (err, db) => err ? reject(err) : resolve(db)))

var insertValues = (values, collection) => Future((reject, resolve) => collection.insert(values, {}, (err, result) => err ? reject(err) : resolve(result)));

var dropCollection = (empty, collection) => Future((reject, resolve) => collection.drop((err, result) => err ? reject(err) : resolve(result)));

var actionThenClose = (url, collectionName, action) => pipe(
    connect,
    chain(db => {
        return pipe(
            () => db.collection(collectionName),
            action,
            map(() => db.close()),
            map(tap(() => console.log('mongo actioned')))
        )();
    })
)(url)

exports.insert = (url, collectionName, values) => actionThenClose(url, collectionName, curry(insertValues)(values));

exports.drop = (url, collectionName, values) => actionThenClose(url, collectionName, curry(dropCollection)(values));

exports.url = 'mongodb://localhost:27017/function_microservices';
