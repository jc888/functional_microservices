var Future = require('ramda-fantasy').Future;
var Identity = require('ramda-fantasy').Identity;
var Maybe = require('ramda-fantasy').Maybe;
var Reader = require('ramda-fantasy').Reader;
var IO = require('ramda-fantasy').IO;

var R = require('ramda');
var rabbitjs = require('rabbit.js');
var express = require('express');
var app = express();

var url = 'amqp://localhost:5672';
var createSocketByType = R.curry((type, context) => context.socket(type));
var connectSocket = R.curry((socket, queue) => Future((reject, resolve) => socket.connect(queue, resolve)).map(() => socket));
var connectSocket2 = R.curry((queue, socket) => Future((reject, resolve) => socket.connect(queue, resolve)).map(() => socket));

var onDataFromSocket = (socket) => Future((reject, resolve) => socket.on('data', resolve));
var sendDataThroughSocket = R.curry((encoding, socket, data) => socket.write(data, encoding));
var sendDataThroughSocket2 = R.curry((encoding, socket, data) => socket.write(data, encoding));

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

var BusB = Identity(rabbitjs.createContext(url));

var subB = BusB
    .map(createSocketByType('SUBSCRIBE'));

var pubB = BusB
    .map(createSocketByType('PUBLISH'));

Future.of()
    .chain(() => subB.map(connectSocket2('toWorker')).get())
    .chain(() => pubB.map(connectSocket2('fromWorker')).get())
    .chain(() => subB.map(onDataFromSocket).get())
    .map(JSON.parse)
    .map(process)
    .map(JSON.stringify)
    .map(data => pubB.map(sendDataThroughSocket2('utf8')))
    .map(closeSubscription(subB.get()))
    .fork(err => console.log(err), () => {});

app.get('/:name', function(req, res) {

    var BusA = Identity(rabbitjs.createContext(url));

    var subA = BusA
        .map(createSocketByType('SUBSCRIBE'))
        .get();

    var pubA = BusA
        .map(createSocketByType('PUBLISH'))
        .get();

    var dispatch = data => res.send(data);

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
