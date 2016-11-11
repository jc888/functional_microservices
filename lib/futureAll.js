// @flow
const { reduce, curry } = require('ramda');
const { Future } = require('ramda-fantasy');

// fromPairs :: [pairs] -> [b]
var fromPairs = reduce((acc, [idx, value]) => {
    acc[idx] = value;
    return acc;
}, []);

// futureAllHandler :: ( a -> Null ) -> Number -> [pairs] -> Number -> d -> [e]
var futureAllHandler = curry((done, futuresLen, results, idx, result) => {
    results.push([idx, result]);
    return (results.length === futuresLen) ? done(fromPairs(results)) : results;
});

// futureAll :: [Future e a] -> Future e b
const futureAll = futures => Future((reject, resolve) => {
    var handler = futureAllHandler(resolve, futures.length, []);
    futures.forEach((fut, idx) => fut.fork(reject, handler(idx)));
});

module.exports = futureAll;
