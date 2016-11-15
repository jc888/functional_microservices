// @flow
const { groupBy, compose, map, chain, prop, path, merge, pluck, head } = require('ramda');
const Future = require('fluture');
const logger = require('../lib/logger');
const mongo = require('../mongo');
const elasticsearch = require('../elasticsearch');

// joinSpeakersWithTalks :: [[t],[s]] -> [ts]
const joinSpeakersWithTalks = ([talks, speakers]) => {
    const speakerMap = groupBy(prop('name'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.speaker]) }), talks)
};

// findSpeakers :: query -> Future e [s]
const findSpeakers = mongo.find('speakers');

// speakerQueryFromTalks :: [t] -> query
const speakerQueryFromTalks = compose(
    speakerNames => ({ name: { $in: speakerNames } }),
    pluck('speaker')
);

// findSpeakersForTalks :: [t] -> Future e [s]
const findSpeakersFromTalks = compose(
    findSpeakers,
    speakerQueryFromTalks
);

// parseResults :: {hits:{hits:[{_source:v}]}} -> [t]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: {q:term} -> Future e [t]
const findTalks = compose(map(parseResults), elasticsearch.search);

// findSpeakersWithTalks :: [t] -> Future e [[t],[s]]
const findSpeakersWithTalks = talks => Future.parallel(5, [Future.of(talks), findSpeakersFromTalks(talks)]);

// search :: {q:term} -> Future e [ts]
const search = compose(
    map(joinSpeakersWithTalks),
    chain(findSpeakersWithTalks),
    map(logger('stuff')),
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
