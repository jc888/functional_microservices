// @flow
const { groupBy, juxt, sequence, curry, compose, map, chain, prop, merge, pluck, head } = require('ramda');
const { Future } = require('ramda-fantasy');
const config = require('config');
const mongoFind = require('./lib/mongoFind')
const elasticSearchFind = require('./lib/elasticSearchFind');

const logger = curry((msg, v) => {
    console.log(msg, v);
    return v;
});


const joinSpeakersWithSearchResult = ([results, speakers]) => {
    const speakerMap = groupBy(prop('name'), speakers);
    return map(r => merge(r, { speaker: head(speakerMap[r.speaker]) }), results)
}

const findSpeakers = compose(
    speakers => mongoFind(config.mongo, 'speakers',{ name: { $in: speakers } }),
    pluck('speaker')
);

const findSpeakersWithResult = compose(sequence(Future.of), juxt([Future.of, findSpeakers]))

const parseSearch = compose(map(prop('_source')), prop('hits'), prop('hits'))
const findTalks = compose(map(parseSearch), elasticSearchFind(config.elasticsearch));

module.exports = compose(
    map(joinSpeakersWithSearchResult),
    chain(findSpeakersWithResult),
    findTalks
)
