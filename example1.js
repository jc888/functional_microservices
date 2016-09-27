var context = require('rabbit.js').createContext('amqp://localhost:5672');
var pub = context.socket('PUBLISH')
var sub = context.socket('SUBSCRIBE');

var stateful = {
    users: [
        { id: 1, name: 'jack' },
        { id: 2, name: 'jack' },
        { id: 3, name: 'john' }
    ],
    countries: [
        { name: "denmark", population: 3000 },
        { name: "poland", population: 2000 },
    ]
}

function getUsers() {
    return stateful.users;
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

function process(criteria) {
    var users = getUsers();
    var result = filterByName(criteria.name, users);
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
