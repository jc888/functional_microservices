const { memoize, sequence, curry, pick, merge, objOf, compose, map, tap, chain, assocPath, prop, path } = require('ramda');
const { Future } = require('ramda-fantasy');

var elasticsearch = require('elasticsearch');
var elasticsearchClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/function_microservices';

var dbConnect = url => Future((reject, resolve) => MongoClient.connect(url, (err, db) => err ? reject(err) : resolve(db)))
var dbCollection = curry((collection, db) => db.collection(collection));
var findInCollection = curry((query, collection) => Future((reject, resolve) => collection.find(query, {}).toArray((err, result) => err ? reject(err) : resolve(result))));

var find = curry((url, collection, query) => compose(
    chain(findInCollection(query)),
    map(dbCollection(collection)),
    dbConnect
)(url))

var findUsers = find(url, 'users');

var searchES = query => Future((reject, resolve) => elasticsearchClient.search(query).then(resolve, reject));
var parseSearchResult = compose(
    map(prop('_source')),
    prop('hits'),
    prop('hits')
)

var buildQueries = map(pick(['name']));

var searchWithResult = compose(map(parseSearchResult), searchES)

var logger = curry((msg, v) => {
    console.log(msg, v);
    return v;
});

var searchHandler = compose(
    //map(logger('users')),
    //findUsers,
    map(buildQueries),
    map(logger('elasticsearch result : ')),
    searchWithResult,
    () => ({ q: 'functional' }),
    logger('searchHandler')
)


module.exports = searchHandler;
