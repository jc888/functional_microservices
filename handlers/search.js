// @flow
const { groupBy, curry, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const logger = require('../lib/logger');
const mongo = require('../mongo');
const elasticsearch = require('../elasticsearch');

// getSpeakerMap :: [Speaker] -> {k:Speaker}
const getSpeakerMap = groupBy(prop('handle'));

// embedSpeaker :: {k:Speaker} -> Talk -> TalkEmbeddedWithSpeaker
const embedSpeaker = curry((speakerMap, talk) =>
    merge(talk, { speaker: head(speakerMap[talk.speaker]) }));

// joinSpeakersWithTalks :: [Talk] -> {k:Speaker} -> [TalkEmbeddedWithSpeaker]
const joinSpeakersWithTalks = curry((talks, speakerMap) =>
    map(embedSpeaker(speakerMap), talks));

// mongoQueryFromTalks :: [Talk] -> SpeakerQuery
const mongoQueryFromTalks = compose(speakers =>
    ({ handle: { $in: speakers } }), pluck('speaker'));

// searchMongo :: SpeakerQuery -> Future Error [Speaker]
const searchMongo = mongo.find('speakers');

// findSpeakersFromTalks :: [Talk] -> Future Error [Speaker]
const findSpeakersFromTalks = compose(searchMongo, mongoQueryFromTalks);

// addSpeakers :: [Talk] -> Future Error [TalkEmbeddedWithSpeaker]
const addSpeakers = talks =>
    compose(map(joinSpeakersWithTalks(talks)), map(getSpeakerMap), findSpeakersFromTalks)(talks);

// searchElasticSearch :: TalkQuery -> Future Error {hits:{hits:[{_source:Talk}]}}
const searchElasticSearch = elasticsearch.search;

// parseResults :: {hits:{hits:[{_source:Talk}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: TalkQuery -> Future Error [Talk]
const findTalks = compose(map(parseResults), searchElasticSearch);

// search :: TalkQuery -> Future Error [TalkEmbeddedWithSpeaker]
const search = compose(chain(addSpeakers), findTalks);


module.exports = {
    joinSpeakersWithTalks,
    findSpeakersFromTalks,
    mongoQueryFromTalks,
    parseResults,
    findTalks,
    search
}
