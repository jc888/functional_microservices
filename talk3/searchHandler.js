// @flow
const { groupBy, ap, sequence, compose, map, chain, prop, merge, pluck, head } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('./lib/logger');
const mongo = require('./mongo');
const elasticsearch = require('./elasticsearch');

const joinSpeakersWithSearchResult = ([results, speakers]) => {
    const speakerMap = groupBy(prop('name'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.speaker]) }), results)
};

const findSpeakers = mongo.find('speakers');

const findSpeakersForTalks = compose(
    findSpeakers,
    speakers => ({ name: { $in: speakers } }),
    pluck('speaker')
);

const findSpeakersWithResult = talks =>
   sequence(Future.of, [Future.of(talks), findSpeakersForTalks(talks)])


const parseResults = compose(pluck('_source'), prop('hits'), prop('hits'));

const findTalks = compose(map(parseResults), elasticsearch.search);

const handler = compose(
    map(joinSpeakersWithSearchResult),
    chain(findSpeakersWithResult),
    map(logger('response')),
    findTalks
);

module.exports = handler;
