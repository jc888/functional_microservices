const { curry } = require('ramda');

module.exports = curry((msg, v) => {
    console.log(msg, v);
    return v;
});
