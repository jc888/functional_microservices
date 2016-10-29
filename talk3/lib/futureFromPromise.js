const { Future } = require('ramda-fantasy');

const futureFromPromise = fn => Future((reject, resolve) => fn().then(resolve, reject))

module.exports = futureFromPromise;
