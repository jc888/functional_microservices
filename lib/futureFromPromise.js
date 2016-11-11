const { Future } = require('ramda-fantasy');

// futureFromPromise :: ( () -> Promise ) -> Future e c
const futureFromPromise = fn => Future((reject, resolve) => fn().then(resolve, reject))

module.exports = futureFromPromise;
