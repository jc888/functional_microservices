// @flow
const { groupBy, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const Future = require('fluture');
const logger = require('../lib/logger');
const mongo = require('../mongo');
const elasticsearch = require('../elasticsearch');

// joinSpeakersWithTalks :: [[Talk],[Speaker]] -> [TalkWithSpeaker]
const joinSpeakersWithTalks = ([talks, speakers]) => {
    const speakerMap = groupBy(prop('handle'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.handle]) }), talks)
};

// findSpeakers :: SpeakerQuery -> Future e [Speaker]
const findSpeakers = mongo.find('speakers');

// speakerQueryFromTalks :: [Talk] -> SpeakerQuery
const speakerQueryFromTalks = compose(
    handles => ({ handle: { $in: handles } }),
    pluck('handle')
);

// findSpeakersForTalks :: [Talk] -> Future e [Speaker]
const findSpeakersFromTalks = compose(
    findSpeakers,
    speakerQueryFromTalks
);

// parseResults :: {hits:{hits:[{_source:v}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: TalkQuery -> Future e [Talk]
const findTalks = compose(map(parseResults), elasticsearch.search);

// findSpeakersWithTalks :: [t] -> Future e [[t],[s]]
const findSpeakersWithTalks = talks => Future.parallel(5, [Future.of(talks), findSpeakersFromTalks(talks)]);

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
