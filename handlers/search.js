// @flow
const { groupBy, curry, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const logger = require('../lib/logger');
const mongo = require('../mongo');
const elasticsearch = require('../elasticsearch');

// getSpeakerMap :: [Speaker] -> SpeakerMap
const getSpeakerMap = groupBy(prop('handle'));

// embedSpeaker :: SpeakerMap -> Talk -> TalkEmbeddedWithSpeaker
const embedSpeaker = curry((speakerMap, talk) =>
    merge(talk, { speaker: head(speakerMap[talk.speaker]) }));

// joinSpeakersWithTalks :: [[Talk],[Speaker]] -> [TalkEmbeddedWithSpeaker]
const joinSpeakersWithTalks = ([talks, speakers]) =>
    map(embedSpeaker(getSpeakerMap(speakers)), talks);

// mongoQueryFromTalks :: [Talk] -> SpeakerQuery
const mongoQueryFromTalks = compose(speakers =>
    ({ handle: { $in: speakers } }), pluck('speaker'));

// searchMongo :: SpeakerQuery -> Future Error [Speaker]
const searchMongo = mongo.find('speakers');

// findSpeakersFromTalks :: [Talk] -> Future Error [Speaker]
const findSpeakersFromTalks = compose(searchMongo, mongoQueryFromTalks);

// findSpeakersWithTalks :: [Talk] -> Future Error [[Talk],[Speaker]]
const findSpeakersWithTalks = talks =>
    compose(map(speakers => ([talks, speakers])), findSpeakersFromTalks)(talks)

// searchElasticSearch :: TalkQuery -> Future Error {hits:{hits:[{_source:Talk}]}}
const searchElasticSearch = elasticsearch.search;

// parseResults :: {hits:{hits:[{_source:Talk}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: TalkQuery -> Future Error [Talk]
const findTalks = compose(map(parseResults), searchElasticSearch);

// search :: TalkQuery -> Future Error [TalkEmbeddedWithSpeaker]
const search = compose(
    map(joinSpeakersWithTalks),
    chain(findSpeakersWithTalks),
    findTalks
);




module.exports = {
    joinSpeakersWithTalks,
    findSpeakersFromTalks,
    mongoQueryFromTalks,
    findSpeakersWithTalks,
    parseResults,
    findTalks,
    search
}
