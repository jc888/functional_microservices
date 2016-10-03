var Future = require('ramda-fantasy').Future;
var Maybe = require('ramda-fantasy').Maybe;
var IO = require('ramda-fantasy').IO;
var R = require('ramda');

var stateful = {
    users: [
        { id: 1, name: 'jack', countryId: 1 },
        { id: 2, name: 'jack', countryId: 2 },
        { id: 3, name: 'john', countryId: 2 }
    ],
    countries: [
        { id: 1, name: "france", population: 3000 },
        { id: 2, name: "germany", population: 2000 },
    ]
}

function getUsers() {
    return stateful.users;
}

function getCountries() {
    return stateful.countries;
}

function filterByName(name, data) {
    var resp = [];
    for (i in data) {
        var entry = data[i];
        if (entry.name == name) {
            resp.push(entry);
        }
    }
    return resp;
}

function extractCountryIds(data) {
    var resp = [];
    for (i in data) {
        var entry = data[i];
        resp.push(entry.countryId);
    }
    return resp;
}

function filterByCountryIds(countryIds, data) {
    var resp = [];
    for (i in data) {
        var entry = data[i];
        for (j in countryIds) {
            var countryId = countryIds[j];
            if (entry.countryId == countryId) {
                resp.push(entry);
            }
        }
    }
    return resp;
}


function process(criteria) {
    var users = getUsers();
    var people = filterByName(criteria.name, users);
    var countryIds = extractCountryIds(people);
    return countryIds;
}

/******
 * functional RedisMQ
 *******/

var RedisSMQ = require("rsmq");
var rsmq = new RedisSMQ({ host: "127.0.0.1", port: 6379, ns: "rsmq" });

var createQueueWithClient = (rsmq, queuename) =>
    Future((reject, resolve) =>
        rsmq.createQueue({ qname: queuename }, (err, resp) => resolve(resp)))

var sendMessageWithClient = (rsmq, queuename, message) =>
    Future((reject, resolve) =>
        rsmq.sendMessage({ qname: queuename, message: message }, (err, resp) => err ? reject(err) : resolve(resp)))

var popMessageWithClient = (rsmq, queuename) =>
    Future((reject, resolve) =>
        rsmq.popMessage({ qname: queuename }, (err, resp) => err ? reject(err) : resolve(resp)))

var createQueue = R.curry(createQueueWithClient)(rsmq);
var popMessage = R.curry(popMessageWithClient)(rsmq);
var sendMessage = R.curry(sendMessageWithClient)(rsmq);

/******
 * functional Mongo
 *******/

var MongoClient = require('mongodb').MongoClient

var url = 'mongodb://localhost:27017/microservices';

var connectDb = (url) => Future((reject, resolve) =>
    MongoClient.connect(url, (err, db) => err ? reject(err) : resolve(db)))

var collectionFind = R.curry((query, collection) =>
    Future((reject, resolve) => collection.find(query).toArray((err, docs) => err ? reject(err) : resolve(docs))))

var collectionInsert = R.curry((query, collection) =>
    Future((reject, resolve) => collection.insertMany(query, (err, docs) => err ? reject(err) : resolve(docs))))

var collectionRemove = R.curry((query, collection) =>
    Future((reject, resolve) => collection.remove(query, (err, docs) => err ? reject(err) : resolve(docs))))

var connectedDb = connectDb(url)

var tapCloseDb = data => connectedDb.map(db => db.close).map(() => data);

/***
 * Mongo process chain
 ****/

var emptyUsers = () => connectedDb
    .map(db => db.collection('users'))
    .chain(collectionRemove({}))
    .map(R.prop('result'))

var insertUsers = () => connectedDb
    .map(db => db.collection('users'))
    .chain(collectionInsert([{ name: 'stuff' }, { name: 'stuff2' }]))
    .map(R.prop('insertedCount'))

var findUsers = () => connectedDb
    .map(db => db.collection('users'))
    .chain(collectionFind({}))

var mongoProcess = (data) => Future.of()
    .chain(emptyUsers)
    .chain(insertUsers)
    .chain(findUsers)
    .chain(tapCloseDb)

/********
 * Manager
 *********/

var express = require('express');
var app = express();

app.get('/:name', function(req, res) {

    var safePayload = Maybe.Just(req)
        .map(R.prop('params'))
        .map(R.prop('name'))
        .map(R.objOf('name'))
        .map(JSON.stringify);

    //message publish
    Future.of()
        .chain(() => createQueue('manager'))
        .chain(() => createQueue('worker'))
        .chain(() => createQueue('worker2'))
        .chain(() => createQueue('complete'))
        .map(() => safePayload.getOrElse())
        .chain(sendMessage('manager'))
        .fork(() => {}, () => {})

    //message collect
    var collectMessage = popMessage('complete')
        .map(R.prop('message'))
        .chain(val => val ? Future.of(val) : Future.reject())
        .map(JSON.parse)
        .map(val => res.send(val))

    var looper = setInterval(() => collectMessage.fork(() => {}, () => {}), 100);

});

module.exports = app;

/********
 * worker
 *********/

var collectMessage = Future.of()
    .chain(() => popMessage('manager'))
    .map(R.prop('message'))
    .chain(val => val ? Future.of(val) : Future.reject(val))
    .map(R.tap(val => console.log('worker recieved', val)))
    .map(JSON.parse)
    .map(process)
    .map(JSON.stringify)
    .chain(sendMessage('worker2'))

var looper = setInterval(() => collectMessage.fork(() => {}, () => {}), 100);


/********
 * worker2
 *********/

var collectMessage2 = Future.of()
    .chain(() => popMessage('worker2'))
    .map(R.prop('message'))
    .chain(val => val ? Future.of(val) : Future.reject(val))
    .map(R.tap(val => console.log('worker recieved', val)))
    .map(JSON.parse)
    .chain(mongoProcess)
    .map(JSON.stringify)
    .chain(sendMessage('complete'))

var looper2 = setInterval(() => collectMessage2.fork(() => {}, () => {}), 100);
