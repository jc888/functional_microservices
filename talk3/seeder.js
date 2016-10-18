const { map, pipe, curry, tap, chain } = require('ramda');
const { Future } = require('ramda-fantasy');
const mongofn = require('./lib/mongofn');
const uuid = require('uuid');

/**
Initialize the database with seed data
**/

pipe(
    Future.of,
    chain(
        () => mongofn.remove(mongofn.url, 'users', {})
    ),
    chain(
        () => mongofn.insert(mongofn.url, 'users', [{
            name: "james"
        }])
    )
)().fork(console.log, () => {});
