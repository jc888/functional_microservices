var Future = require('ramda-fantasy').Future;
var Identity = require('ramda-fantasy').Identity;
var R = require('ramda');
var rabbitjs = require('rabbit.js');
var express = require('express');
var app = express();

var url = 'amqp://localhost:5672';
var BusA = R.always(rabbitjs.createContext(url));
var BusB = R.always(rabbitjs.createContext(url));
var createSocketByType = (contextFunc, type) => contextFunc().socket(type);
var connectSocket = R.curry((socket, queue) => Future((reject, resolve) => socket.connect(queue, resolve)).map(() => socket));
var onDataSocket = (socket) => Future((reject, resolve) => socket.on('data', resolve));


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

var subB = createSocketByType(BusB, 'SUBSCRIBE');
var pubB = createSocketByType(BusB, 'PUBLISH');

connectSocket(subB, 'toWorker')
    .chain(subB => onDataSocket(subB))
    .map(JSON.parse)
    .map(process)
    .chain(data => {
        return connectSocket(pubB, 'fromWorker')
            .map(pubB => pubB.write(JSON.stringify(data), 'utf8'))
            .map(() => subB.close());
    })
    .fork(err => console.log(err), () => {});

app.get('/:name', function(req, res) {
    var subA = createSocketByType(BusA, 'SUBSCRIBE');
    var pubA = createSocketByType(BusA, 'PUBLISH');

    onDataSocket(subA)
        .map(JSON.parse)
        .map(data => res.json(data))
        .map(() => subA.close())
        .fork(err => console.log(err), () => {});

    connectSocket(subA, 'fromWorker')
        .chain(() => connectSocket(pubA, 'toWorker'))
        .map(pubA => pubA.write(JSON.stringify({ name: req.params.name }), 'utf8'))
        .fork(err => console.log(err), () => {});
});

module.exports = app;
