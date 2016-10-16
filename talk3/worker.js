const reciever = require('./reciever');
const dispatcher = require('./dispatcher');
const R = require('ramda');
const { when, equals, propSatisfies, map, compose, zip, fromPairs, pipe, nth, curry, tap, chain, unapply, always, juxt, mergeAll, identity, prop, objOf, assoc, converge, construct } = require('ramda');
const { Future } = require('ramda-fantasy');

var handle = pipe(
    Future.of,
    map(tap(val => console.log('worker processing', val.msg))),
    map(always({
        'status': 'complete'
    })),
    chain(dispatcher('complete'))
)

reciever('worker', handle);
