const Future = require('fluture');

// futureFromPromise :: ( () -> Promise e a ) -> Future e a
const futureFromPromise = fn => Future((reject, resolve) => {
    fn().then(resolve, reject);
    return () => {};
})

module.exports = futureFromPromise;
