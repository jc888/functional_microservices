const { curry } = require('ramda');

// logger :: String -> a -> a
module.exports = curry((msg, v) => {
    console.log(msg, v);
    return v;
});
