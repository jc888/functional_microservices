// @flow
const { groupBy, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('./lib/logger');
const mongo = require('./mongo');
const elasticsearch = require('./elasticsearch');
const parallel = require('parallel-future')(Future);

// joinSpeakersWithTalks :: [a] -> [b]
const joinSpeakersWithTalks = ([results, speakers]) => {
    const speakerMap = groupBy(prop('name'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.speaker]) }), results)
};

// findSpeakers :: a -> Future e b
const findSpeakers = mongo.find('speakers');

// speakerQueryFromTalks :: [{speaker:v}] -> b
const speakerQueryFromTalks = compose(
    speakers => ({ name: { $in: speakers } }),
    pluck('speaker')
);

// findSpeakersForTalks :: [a] -> Future e b
const findSpeakersFromTalks = compose(
    findSpeakers,
    speakerQueryFromTalks
);

// findSpeakersWithTalks :: [a] -> Future e b
const findSpeakersWithTalks = compose(
    parallel,
    talks => [Future.of(talks), findSpeakersFromTalks(talks)]
);

// parseResults :: {hits:{hits:[{_source:v}]}} -> [talks]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: {q:a} -> Future e talks
const findTalks = compose(map(parseResults), elasticsearch.search);

// handler :: {q:a} -> Future e b
const handler = compose(
    map(joinSpeakersWithTalks),
    chain(findSpeakersWithTalks),
    findTalks
);

module.exports = handler;
