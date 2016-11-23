// @flow
const { indexBy, assoc, curry, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const { MongoClient } = require('mongodb');
const elasticsearch = require('elasticsearch');
const Future = require('fluture');

// innerJoin :: String -> String -> [a] -> [b] -> [{String:a}]
const innerJoin = curry((k1, k2, l1, l2) => {
    var list2Map = indexBy(prop(k2), l2);
    return map(l1v => assoc(k1, list2Map[l1v[k1]], l1v), l1)
});

// searchMongo :: SpeakerQuery -> Future Error [Speaker]
const searchMongo = query => Future((reject, resolve) => {
    MongoClient.connect('mongodb://mongo:27017/function_microservices')
        .then(db => db.collection('speakers'))
        .then(coll => coll.find(query).toArray())
        .then(resolve)
        .catch(reject);
});

// mongoQueryFromTalks :: [Talk] -> SpeakerQuery
const mongoQueryFromTalks = compose(speakers =>
    ({ handle: { $in: speakers } }), pluck('speaker'));

// findSpeakersFromTalks :: [Talk] -> Future Error [Speaker]
const findSpeakersFromTalks = compose(searchMongo, mongoQueryFromTalks);

// addSpeakers :: [Talk] -> Future Error [TalkEmbeddedWithSpeaker]
const addSpeakers = talks =>
    compose(map(innerJoin('speaker', 'handle', talks)), findSpeakersFromTalks)(talks);

// parseResults :: {hits:{hits:[{_source:Talk}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// searchElasticSearch :: TalkQuery -> Future Error {hits:{hits:[{_source:Talk}]}}
const searchElasticSearch = query => Future((reject, resolve) => {
    new elasticsearch.Client({
            host: 'elasticsearch:9200',
            log: 'error'
        })
        .search(query)
        .then(resolve)
        .catch(reject);
});

// findTalks :: TalkQuery -> Future Error [Talk]
const findTalks = compose(map(parseResults), searchElasticSearch);

// search :: TalkQuery -> Future Error [TalkEmbeddedWithSpeaker]
const search = compose(chain(addSpeakers), findTalks);

module.exports = {
    mongoQueryFromTalks,
    addSpeakers,
    findTalks,
    search
}
