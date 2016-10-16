const R = require('ramda');
const { map, compose, pipe, curry, tap, chain, always } = require('ramda');
const { Future } = require('ramda-fantasy');

const dispatcher = require('./dispatcher');
const reciever = require('./reciever');

dispatcher('worker')({
    type: "blah"
}).fork(() => {}, () => {})

dispatcher('worker')({
    type: "blah"
}).fork(() => {}, () => {})

const handle = pipe(
	tap(val=>console.log('complete',val.id)),
    Future.of
)
reciever('complete', handle);
