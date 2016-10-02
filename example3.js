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

    Future.of()
        .chain(() => createQueue('manager'))
        .chain(() => createQueue('worker'))
        .map(() => safePayload.getOrElse())
        .chain(sendMessage('manager'))
        .fork(() => {}, () => {})


    var collectMessage = popMessage('worker')
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
    .chain(sendMessage('worker'))

var looper = setInterval(() => collectMessage.fork(() => {}, () => {}), 100);
