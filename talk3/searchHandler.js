// @flow
const { groupBy, juxt, sequence, curry, compose, map, chain, prop, merge, pluck, head } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('./lib/logger');
const mongoFind = require('./mongoFind');
const elasticsearch = require('./elasticsearch');

const joinSpeakersWithSearchResult = ([results, speakers]) => {
    const speakerMap = groupBy(prop('name'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.speaker]) }), results)
}

const findSpeakers = compose(
    speakers => mongoFind({ name: { $in: speakers } }),
    pluck('speaker')
);

const findSpeakersWithResult = compose(sequence(Future.of), juxt([Future.of, findSpeakers]))

const parseSearch = compose(map(prop('_source')), prop('hits'), prop('hits'))
const findTalks = compose(map(parseSearch), elasticsearch);

const handler = compose(
    map(joinSpeakersWithSearchResult),
    chain(findSpeakersWithResult),
    findTalks
)

module.exports = handler;