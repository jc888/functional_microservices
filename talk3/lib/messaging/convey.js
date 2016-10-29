const { merge, compose, map, chain, juxt, mergeAll, prop, objOf } = require('ramda');
const { Future } = require('ramda-fantasy');
const reciever = require('./reciever');
const dispatcher = require('./dispatcher');

const convey = (incomingQueue, outgoingQueue, asyncActionFn) => {

    let wrapper = val => compose(
        chain(dispatcher(outgoingQueue)),
        map(merge(val)),
        map(objOf('payload')),
        asyncActionFn,
        prop('payload')
    )(val);

    return reciever(incomingQueue, wrapper);
};

module.exports = convey;
