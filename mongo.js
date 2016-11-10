var conf = { url: 'mongodb://localhost:27017/function_microservices' };

exports.find = require('./lib/mongo/find')(conf);
exports.insert = require('./lib/mongo/insert')(conf);
exports.remove = require('./lib/mongo/remove')(conf);
