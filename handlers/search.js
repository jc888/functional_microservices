// @flow
const { groupBy, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const Future = require('fluture');
const logger = require('../lib/logger');
const mongo = require('../mongo');
const elasticsearch = require('../elasticsearch');

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

// parseResults :: {hits:{hits:[{_source:v}]}} -> [talks]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: {q:a} -> Future e talks
const findTalks = compose(map(parseResults), elasticsearch.search);

// search :: {q:a} -> Future e b
const search = compose(
    map(joinSpeakersWithTalks),
    chain(talks => Future.parallel(5, [Future.of(talks), findSpeakersFromTalks(talks)])),
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
