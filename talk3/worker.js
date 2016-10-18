const reciever = require('./lib/reciever');
const dispatcher = require('./lib/dispatcher');
const { merge, objOf, pipe, map, tap, chain, assocPath, prop } = require('ramda');
const { Future } = require('ramda-fantasy');
const mongofn = require('./lib/mongofn');

var handle = pipe(
    tap(val => console.log('worker recieved', val)),
    Future.of,
    chain(val => pipe(
        () => mongofn.find(mongofn.url, 'users', {}),
        map(objOf('users')),
        map(merge(val))
    )()),
    chain(dispatcher('broker'))
)

reciever('worker', handle);
