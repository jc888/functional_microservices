// @flow
const { groupBy, curry, compose, map, chain, prop, merge, pluck, head } = require('ramda');
const { Future } = require('ramda-fantasy');
const mongo = require('./mongo')
const elasticsearch = require('./elasticSearch')

const logger = curry((msg, v) => {
    console.log(msg, v);
    return v;
});

const parseSearch = compose(map(prop('_source')), prop('hits'), prop('hits'))
const findTalks = compose(map(parseSearch), elasticsearch);

const findSpeakers = speakers => mongo.find({_id: {$in: speakers}})
const speakersAndResults = results => Future.all([Future.of(results), findSpeakers(pluck('_id', results.speakers))])

const joinSpeakersWithSearchResult = ([results, speakers]) => {
  const speakerMap = groupBy(prop('_id', speakers))
  return map(r => merge(r, {speaker: head(speakerMap[r._id])}), results)
}
const findSpeakersAndJoinWithResult = compose(map(joinSpeakersWithSearchResult), speakersAndResults)

module.exports = compose(chain(findSpeakersAndJoinWithResult), findTalks)
