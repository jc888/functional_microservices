// @flow
const { groupBy, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('./lib/logger');
const mongo = require('./mongo');
const elasticsearch = require('./elasticsearch');
const parallel = require('parallel-future')(Future);

// joinSpeakersWithTalks :: [[SearchResult], [Speaker]] -> [TalkWithSpeaker]
const joinSpeakersWithTalks = ([results, speakers]) => {
    const speakerMap = groupBy(prop('name'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.speaker]) }), results)
};

// findSpeakers :: SpeakerQuery -> Future e [Speaker]
const findSpeakers = mongo.find('speakers');

// speakerQueryFromTalks :: [{speaker: String}] -> SpeakerQuery
const speakerQueryFromTalks = compose(
    speakers => ({ name: { $in: speakers } }),
    pluck('speaker')
);

// findSpeakersForTalks :: [{speaker: String}] -> Future e [Speaker]
const findSpeakersFromTalks = compose(
    findSpeakers,
    speakerQueryFromTalks
);

// findSpeakersWithTalks :: [Talk] -> Future e [[Talks], [Speaker]]
const findSpeakersWithTalks = compose(
    parallel,
    talks => [Future.of(talks), findSpeakersFromTalks(talks)]
);

// parseResults :: {hits:{hits:[{_source:v}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: TalkQuery -> Future e [Talk]
const findTalks = compose(map(parseResults), elasticsearch.search);

// handler :: TalkQuery -> Future e [TalkWithSpeaker]
const handler = compose(
    map(joinSpeakersWithTalks),
    chain(findSpeakersWithTalks),
    findTalks
);

module.exports = handler;
