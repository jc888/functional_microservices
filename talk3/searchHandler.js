const { sequence, reduce, curry, merge, objOf, compose, map, chain, prop } = require('ramda');
const { Future } = require('ramda-fantasy');

const logger = curry((msg, v) => {
    console.log(msg, v);
    return v;
});

const elasticsearchConf = {
    host: 'localhost:9200',
    log: 'error'
};

const mongoConf = {
    url: 'mongodb://localhost:27017/function_microservices'
};

const elasticsearch = require('elasticsearch');
const elasticsearchClient = new elasticsearch.Client(elasticsearchConf);

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = conf => Future((reject, resolve) => MongoClient.connect(conf.url, (err, db) => err ? reject(err) : resolve(db)))
const mongoCollection = curry((collectionName, db) => db.collection(collectionName));
const findOne = curry((query, collection) => Future((reject, resolve) => collection.findOne(query, {}, (err, result) => err ? reject(err) : resolve(result))));

const find = curry((url, collectionName, query) => compose(
    chain(findOne(query)),
    map(mongoCollection(collectionName)),
    mongoConnect
)(url));

const search = query => Future((reject, resolve) => elasticsearchClient.search(query).then(resolve, reject));
const parseSearch = compose(map(prop('_source')), prop('hits'), prop('hits'))
const findTalks = compose(map(parseSearch), search);

const findSpeaker = find(mongoConf, 'speakers');
const queryFromTalk = compose(objOf('name'), prop('speaker'));
const findSpeakerForTalk = compose(findSpeaker, queryFromTalk);
const findSpeakerAndJoin = talk => compose(map(merge(talk)), findSpeakerForTalk)(talk);
const findSpeakerForEachTalk = compose(sequence(Future.of), map(findSpeakerAndJoin));

const searchHandler = compose(
    chain(findSpeakerForEachTalk),
    map(logger('search results : ')),
    findTalks,
    logger('search term : ')
)

module.exports = searchHandler;
