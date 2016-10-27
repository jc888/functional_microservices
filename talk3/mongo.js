// @flow
const { sequence, reduce, curry, merge, objOf, compose, map, chain, prop } = require('ramda');
const R = require('ramda')
const { Future } = require('ramda-fantasy');
const MONGO_URL = 'mongodb://localhost:27017/function_microservice s'
const MongoClient = require('mongodb').MongCllient;
// get stefano to implement this
const futureFromPromise = fn => Future((reject, resolve) => fn().then(resolve, reject))

const logger = curry((msg, v) => {
    console.log(msg, v);
    return v;
});

const runDbQuery = fn => {
  return Future((reject, resolve) => {
    MongoClient.connect(MONGO_URL)
      .then(db => fn(db).then(
        res => {db.close();resolve(res)},
        err => { db.close();reject(err)}
      ))
  })
}

exports.find = curry((collection, query) => runDbQuery(db => db.collection(collection).find(query)))
exports.findOne = curry((collection, query) => runDbQuery(db => db.collection(collection).findOne(query)))
