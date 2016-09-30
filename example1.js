var context = require('rabbit.js').createContext('amqp://localhost:5672');
var pub = context.socket('PUBLISH')
var sub = context.socket('SUBSCRIBE');

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
    
    return result;
}

sub.connect('toWorker', function() {
    sub.on('data', function(note) {
        var result = process(JSON.parse(note));
        pub.connect('fromWorker', function() {
            pub.write(JSON.stringify(result), 'utf8');
            sub.close();
        });
    });

});

var context = require('rabbit.js').createContext('amqp://localhost:5672');
var express = require('express');
var app = express();

app.get('/:name', function(req, res) {
    var pub = context.socket('PUBLISH')
    var sub = context.socket('SUBSCRIBE');

    sub.connect('fromWorker', function() {
        sub.on('data', function(note) {
            res.json(JSON.parse(note))
            sub.close();
        })
        pub.connect('toWorker', function() {
            pub.write(JSON.stringify({ name: req.params.name }), 'utf8');
        });
    });


});

module.exports = app;
