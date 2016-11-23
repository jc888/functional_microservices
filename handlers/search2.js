// @flow
const { indexBy, assoc, curry, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const logger = require('../lib/logger');
const mongo = require('../mongo');
const elasticsearch = require('../elasticsearch');

// innerJoin :: String -> String -> [a] -> [b] -> [{String:a}]
const innerJoin = curry((k1, k2, l1, l2) => {
    var list2Map = indexBy(prop(k2), l2);
    return map(l1v => assoc(k1, list2Map[l1v[k1]], l1v), l1)
});

// mongoQueryFromTalks :: [Talk] -> SpeakerQuery
const mongoQueryFromTalks = compose(speakers =>
    ({ handle: { $in: speakers } }), pluck('speaker'));

// searchMongo :: SpeakerQuery -> Future Error [Speaker]
const searchMongo = mongo.find('speakers');

// findSpeakersFromTalks :: [Talk] -> Future Error [Speaker]
const findSpeakersFromTalks = compose(searchMongo, mongoQueryFromTalks);

// addSpeakers :: [Talk] -> Future Error [TalkEmbeddedWithSpeaker]
const addSpeakers = talks =>
    compose(map(innerJoin('speaker', 'handle', talks)), findSpeakersFromTalks)(talks);

// searchElasticSearch :: TalkQuery -> Future Error {hits:{hits:[{_source:Talk}]}}
const searchElasticSearch = elasticsearch.search;

// parseResults :: {hits:{hits:[{_source:Talk}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

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
