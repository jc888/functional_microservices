// @flow
const { groupBy, ap, of, sequence, compose, map, chain, prop, merge, pluck, head } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('./lib/logger');
const mongoSpeakers = require('./mongoSpeakers');
const elasticsearch = require('./elasticsearch');

const joinSpeakersWithSearchResult = ([results, speakers]) => {
    const speakerMap = groupBy(prop('name'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.speaker]) }), results)
}

const findSpeakers = compose(
    speakers => mongoSpeakers.find({ name: { $in: speakers } }),
    pluck('speaker')
);

const findSpeakersWithResult = compose(
    sequence(Future.of),
    ap([Future.of, findSpeakers]),
    of
)

const parseResults = compose(
    map(prop('_source')),
    prop('hits'),
    prop('hits')
)

const findTalks = compose(map(parseResults), elasticsearch.search);

const handler = compose(
    map(joinSpeakersWithSearchResult),
    chain(findSpeakersWithResult),
    findTalks
)

module.exports = handler;
