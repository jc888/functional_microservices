const Future = require('fluture');

// futureFromPromise :: ( () -> Promise ) -> Future e c
const futureFromPromise = fn => Future((reject, resolve) => {
    fn().then(resolve, reject);
    return () => {};
})

module.exports = futureFromPromise;
