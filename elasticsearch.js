var conf = {
    host: 'elasticsearch:9200',
    log: 'error'
};

exports.search = require('./lib/elasticsearch/search')(conf);
exports.create = require('./lib/elasticsearch/create')(conf);
exports.delete = require('./lib/elasticsearch/delete')(conf);
exports.exists = require('./lib/elasticsearch/exists')(conf);
exports.upsert = require('./lib/elasticsearch/upsert')(conf);
