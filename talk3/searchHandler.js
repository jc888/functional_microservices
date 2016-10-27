const { sequence, groupBy, evolve, reduce, curry, merge, objOf, compose, map, chain, prop } = require('ramda');
const { Future } = require('ramda-fantasy');
const mongoFind = require('./lib/mongoFind');
const elasticSearchFind = require('./lib/elasticSearchFind');
const config = require('config');

const logger = curry((msg, v) => {
    console.log(msg, v);
    return v;
});

const queryElasticSearch = elasticSearchFind(config.elasticsearch);
const parseElasticSearchResults = compose(map(prop('_source')), prop('hits'), prop('hits'));
const findTalks = compose(map(parseElasticSearchResults), queryElasticSearch);

const findSpeaker = mongoFind(config.mongo, 'speakers');
const queryFromTalk = compose(objOf('name'), prop('speaker'));
const findSpeakerForTalk = compose(findSpeaker, queryFromTalk);
const findSpeakerAndJoin = talk => compose(map(merge(talk)), findSpeakerForTalk)(talk);
const findSpeakersForTalks = compose(sequence(Future.of), map(findSpeakerAndJoin));
const groupByJob = groupBy(prop('title'));

const searchHandler = compose(
    map(groupByJob),
    chain(findSpeakersForTalks),
    map(logger('search results : ')),
    findTalks,
    logger('search term : ')
)

module.exports = searchHandler;
