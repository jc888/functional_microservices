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

// findSpeakers :: SpeakerQuery -> Future e [Speaker]
const findSpeakers = mongo.find('speakers');

// speakerQueryFromTalks :: [Talk] -> SpeakerQuery
const speakerQueryFromTalks = compose(
    handles => ({ handle: { $in: handles } }),
    pluck('speaker')
);

// findSpeakersFromTalks :: [Talk] -> Future e [Speaker]
const findSpeakersFromTalks = compose(
    findSpeakers,
    speakerQueryFromTalks
);

// findSpeakersWithTalks :: [Talk] -> Future e [[Talk],[Speaker]]
const findSpeakersWithTalks = talks => Future.parallel(5, [Future.of(talks), findSpeakersFromTalks(talks)]);

// parseResults :: {hits:{hits:[{_source:v}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: TalkQuery -> Future e [Talk]
const findTalks = compose(map(parseResults), elasticsearch.search);

// search :: TalkQuery -> Future e [TalkWithSpeaker]
const search = compose(
    map(joinSpeakersWithTalks),
    chain(findSpeakersWithTalks),
    findTalks
);

module.exports = {
    joinSpeakersWithTalks,
    findSpeakers,
    speakerQueryFromTalks,
    findSpeakersFromTalks,
    parseResults,
    findTalks,
    search
}
