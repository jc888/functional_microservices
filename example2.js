var Future = require('ramda-fantasy').Future;
var Identity = require('ramda-fantasy').Identity;
var Maybe = require('ramda-fantasy').Maybe;
var Reader = require('ramda-fantasy').Reader;

var R = require('ramda');
var rabbitjs = require('rabbit.js');
var express = require('express');
var app = express();

var url = 'amqp://localhost:5672';
var createSocketByType = (contextFunc, type) => contextFunc().socket(type);
var connectSocket = R.curry((socket, queue) => Future((reject, resolve) => socket.connect(queue, resolve)).map(() => socket));
var onDataFromSocket = (socket) => Future((reject, resolve) => socket.on('data', resolve));
var sendDataThroughSocket = R.curry((encoding, socket, data) => socket.write(data, encoding));
var closeSubscription = R.curry((socket, data) => socket.close());

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

var BusB = R.always(rabbitjs.createContext(url));
var subB = createSocketByType(BusB, 'SUBSCRIBE');
var pubB = createSocketByType(BusB, 'PUBLISH');

Future.of()
    .chain(() => connectSocket(subB, 'toWorker'))
    .chain(() => connectSocket(pubB, 'fromWorker'))
    .chain(() => onDataFromSocket(subB))
    .map(JSON.parse)
    .map(process)
    .map(JSON.stringify)
    .map(sendDataThroughSocket('utf8', pubB))
    .map(closeSubscription(subB))
    .fork(err => console.log(err), () => {});

app.get('/:name', function(req, res) {
    var BusA = R.always(rabbitjs.createContext(url));
    var subA = createSocketByType(BusA, 'SUBSCRIBE');
    var pubA = createSocketByType(BusA, 'PUBLISH');
    var dispatch = (data) => res.json(data);

    var safeGetMessage = Maybe.Just(req)
        .map(R.prop('params'))
        .map(R.prop('name'))
        .map(R.objOf('name'))
        .map(JSON.stringify)

    //channel listener
    Future.of()
        .chain(() => connectSocket(subA, 'fromWorker'))
        .chain(() => onDataFromSocket(subA))
        .map(JSON.parse)
        .map(dispatch)
        .map(closeSubscription(subA))
        .fork(err => console.log(err), () => {});

    //channel sender
    Future((reject, resolve) => setTimeout(resolve, 100))
        .chain(() => connectSocket(pubA, 'toWorker'))
        .map(() => safeGetMessage.getOrElse())
        .map(sendDataThroughSocket('utf8', pubA))
        .fork(err => console.log(err), () => {});
});

module.exports = app;
