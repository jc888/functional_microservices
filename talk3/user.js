const reciever = require('./lib/reciever');
const dispatcher = require('./lib/dispatcher');
const R = require('ramda');
const { pipe, map, tap, chain, assocPath, prop } = require('ramda');
const { Future } = require('ramda-fantasy');

var handle = pipe(
    tap(val => console.log('worker recieved', val)),
    assocPath(['user', 'name'], 'james'),
    assocPath(['user', 'surname'], 'chow'),
    Future.of,
    chain(dispatcher('permissions'))
)

reciever('user', handle);
