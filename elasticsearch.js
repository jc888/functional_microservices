var conf = {
    host: 'elasticsearch:9200',
    log: 'error'
};

// search :: String -> query -> Future e a
exports.search = require('./lib/elasticsearch/search')(conf);

// create :: String -> query -> Future e a
exports.create = require('./lib/elasticsearch/create')(conf);

// delete :: String -> query -> Future e a
exports.delete = require('./lib/elasticsearch/delete')(conf);

// exists :: String -> query -> Future e a
exports.exists = require('./lib/elasticsearch/exists')(conf);

// upsert :: String -> query -> Future e a
exports.upsert = require('./lib/elasticsearch/upsert')(conf);
