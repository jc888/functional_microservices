const reciever = require('./lib/reciever');
const EventEmitter = require('events');
const { map, compose, pipe, curry, tap, chain, always } = require('ramda');
const { Future } = require('ramda-fantasy');

class Broker extends EventEmitter {}

const broker = new Broker();

const handle = pipe(
    Future.of,
    map(tap(val => console.log('broker', val))),
    map(tap(val => broker.emit(val.correlationId, val)))
)

reciever('broker', handle);

module.exports = broker;
