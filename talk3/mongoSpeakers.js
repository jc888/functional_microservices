var conf = { url: 'mongodb://localhost:27017/function_microservices' };
var collectionName = 'speakers';

exports.find = require('./lib/mongo/find')(conf, collectionName);
exports.insert = require('./lib/mongo/insert')(conf, collectionName);
exports.remove = require('./lib/mongo/remove')(conf, collectionName);
