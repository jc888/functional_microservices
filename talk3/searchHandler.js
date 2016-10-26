const { sequence, reduce, curry, merge, objOf, compose, map, chain, prop } = require('ramda');
const { Future } = require('ramda-fantasy');

var logger = curry((msg, v) => {
    console.log(msg, v);
    return v;
});

var elasticsearchConf = {
    host: 'localhost:9200',
    log: 'error'
};

var mongoConf = {
    url: 'mongodb://localhost:27017/function_microservices'
};

var elasticsearch = require('elasticsearch');
var elasticsearchClient = new elasticsearch.Client(elasticsearchConf);

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

var mongoConnect = conf => Future((reject, resolve) => MongoClient.connect(conf.url, (err, db) => err ? reject(err) : resolve(db)))
var mongoCollection = curry((collectionName, db) => db.collection(collectionName));
var findOne = curry((query, collection) => Future((reject, resolve) => collection.findOne(query, {}, (err, result) => err ? reject(err) : resolve(result))));

var search = query => Future((reject, resolve) => elasticsearchClient.search(query).then(resolve, reject));
var parseSearch = compose(map(prop('_source')), prop('hits'), prop('hits'))
var findTalks = compose(map(parseSearch), search);

var find = curry((url, collectionName, query) => compose(
    chain(findOne(query)),
    map(mongoCollection(collectionName)),
    mongoConnect
)(url))

var findSpeaker = find(mongoConf, 'speakers');

var queryFromTalk = compose(objOf('name'), prop('speaker'))

var findSpeakerAndJoin = talk => compose(
    map(merge(talk)),
    map(logger('found speaker')),
    findSpeaker,
    queryFromTalk
)(talk);

var findSpeakerForEachTalk = compose(
    sequence(Future.of),
    map(findSpeakerAndJoin)
);

var searchHandler = compose(
    chain(findSpeakerForEachTalk),
    map(logger('search results : ')),
    findTalks,
    logger('search term : ')
)

module.exports = searchHandler;
