const { curry, compose, ifElse, equals, chain } = require('ramda');
const { Future } = require('ramda-fantasy');

const exists = require('./exists');
const create = require('./create');
const remove = require('./delete');

// upsert :: conf -> query -> Future e result
const upsert = curry((conf, query) => {
    var existsFn = () => exists(conf,query);
    var createFn = () => create(conf,query);
    var removeFn = () => remove(conf,query);
    var removeIfExists = ifElse(equals(true), removeFn, Future.of);

    return compose(
        chain(createFn),
        chain(removeIfExists),
        existsFn
    )()
})

module.exports = upsert;
