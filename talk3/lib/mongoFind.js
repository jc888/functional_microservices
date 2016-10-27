const { curry, chain, map, compose } = require('ramda');
const { Future } = require('ramda-fantasy');
const { MongoClient } = require('mongodb');

const mongoConnect = conf => Future((reject, resolve) => MongoClient.connect(conf.url, (err, db) => err ? reject(err) : resolve(db)));
const mongoCollection = curry((collectionName, db) => db.collection(collectionName));
const findOne = curry((query, collection) => Future((reject, resolve) => collection.findOne(query, {}, (err, result) => err ? reject(err) : resolve(result))));

const find = curry((conf, collectionName, query) => compose(
    chain(findOne(query)),
    map(mongoCollection(collectionName)),
    mongoConnect
)(conf));

module.exports = find;
