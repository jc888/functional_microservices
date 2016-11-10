// @flow
const { reduce, curry } = require('ramda');
const { Future } = require('ramda-fantasy');

var fromPairs = reduce((acc, [idx, value]) => {
    acc[idx] = value;
    return acc;
}, []);

var futureAllHandler = curry((done, futuresLen, results, idx, value) => {
    results.push([idx, value]);
    return (results.length === futuresLen) ? done(fromPairs(results)) : results;
});

const futureAll = futures => Future((reject, resolve) => {
    var handler = futureAllHandler(resolve, futures.length, []);
    futures.forEach((fut, idx) => fut.fork(reject, handler(idx)));
});

module.exports = futureAll;
