// @flow
const { groupBy, ap, of, sequence, compose, map, chain, prop, merge, pluck, head } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('./lib/logger');
const mongo = require('./mongo');
const elasticsearch = require('./elasticsearch');

const joinSpeakersWithSearchResult = ([results, speakers]) => {
    const speakerMap = groupBy(prop('name'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.speaker]) }), results)
};

const findSpeakers = compose(
    speakers => mongo.find('speakers', { name: { $in: speakers } }),
    pluck('speaker')
);

const findSpeakersWithResult = compose(
    sequence(Future.of),
    ap([Future.of, findSpeakers]),
    talks => [talks]
);

const parseResults = compose(pluck('_source'), prop('hits'), prop('hits'));

const findTalks = compose(map(parseResults), elasticsearch.search);

const handler = compose(
    map(joinSpeakersWithSearchResult),
    chain(findSpeakersWithResult),
    findTalks
);

module.exports = handler;
