//lets require/import the mongodb native drivers.
const { memoize, map, pipe, curry, tap, chain, has } = require('ramda');
const { Future } = require('ramda-fantasy');
const RSMQWorker = require("rsmq-worker");
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

var connect = url => Future((reject, resolve) => MongoClient.connect(url, (err, db) => err ? reject(err) : resolve(db)))

var insertCollection = (values, collection) => Future((reject, resolve) => collection.insert(values, {}, (err, result) => err ? reject(err) : resolve(result)));

var removeCollection = (query, collection) => Future((reject, resolve) => collection.remove(query, (err, result) => err ? reject(err) : resolve(result)));

var findCollection = (query, collection) => Future((reject, resolve) => collection.find(query, {}).toArray((err, result) => err ? reject(err) : resolve(result)));

var dropCollection = (empty, collection) => Future((reject, resolve) => collection.drop((err, result) => err ? reject(err) : resolve(result)));

var actionThenClose = (url, collectionName, action) => pipe(
    connect,
    chain(db => {
        return pipe(
            () => db.collection(collectionName),
            action,
            map(tap(() => db.close())),
            map(tap(() => console.log('mongo operation')))
        )();
    })
)(url)

exports.insert = (url, collectionName, values) => actionThenClose(url, collectionName, curry(insertCollection)(values));

exports.drop = (url, collectionName, values) => actionThenClose(url, collectionName, curry(dropCollection)(values));

exports.remove = (url, collectionName, query) => actionThenClose(url, collectionName, curry(removeCollection)(query));

exports.find = (url, collectionName, query) => actionThenClose(url, collectionName, curry(findCollection)(query));

exports.url = 'mongodb://localhost:27017/function_microservices';
