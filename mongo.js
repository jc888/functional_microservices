var conf = { url: 'mongodb://mongo:27017/function_microservices' };

// find :: String -> query -> Future e a
exports.find = require('./lib/mongo/find')(conf);

// insert :: String -> query -> Future e a
exports.insert = require('./lib/mongo/insert')(conf);

// remove :: String -> query -> Future e a
exports.remove = require('./lib/mongo/remove')(conf);
