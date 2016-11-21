// @flow
const { groupBy, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const Future = require('fluture');
const logger = require('../lib/logger');
const mongo = require('../mongo');
const elasticsearch = require('../elasticsearch');

// joinSpeakersWithTalks :: [[Talk],[Speaker]] -> [TalkWithSpeaker]
const joinSpeakersWithTalks = ([talks, speakers]) => {
    const speakerMap = groupBy(prop('handle'), speakers);
    return map(talk => merge(talk, { speaker: head(speakerMap[talk.speaker]) }), talks)
};

// mongoQueryFromTalks :: [Talk] -> SpeakerQuery
const mongoQueryFromTalks = compose(speakers => ({ handle: { $in: speakers } }), pluck('speaker'));

// searchMongo :: SpeakerQuery -> Future Error [Speaker]
const searchMongo = mongo.find('speakers');

// findSpeakersFromTalks :: [Talk] -> Future Error [Speaker]
const findSpeakersFromTalks = compose(searchMongo, mongoQueryFromTalks);

// findSpeakersWithTalks :: [Talk] -> Future Error [[Talk],[Speaker]]
const findSpeakersWithTalks = talks => Future.parallel(5, [Future.of(talks), findSpeakersFromTalks(talks)]);

// searchElasticSearch :: TalkQuery -> {hits:{hits:[{_source:Talk}]}}
const searchElasticSearch = elasticsearch.search;

// parseResults :: {hits:{hits:[{_source:Talk}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: TalkQuery -> Future Error [Talk]
const findTalks = compose(map(parseResults), searchElasticSearch);

// search :: TalkQuery -> Future Error [TalkWithSpeaker]
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
