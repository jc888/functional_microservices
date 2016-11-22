// @flow
const { indexBy, assoc, curry, compose, map, chain, prop, path, merge, pluck } = require('ramda');
const innerJoin = require('../lib/innerJoin');
const logger = require('../lib/logger');
const mongo = require('../mongo');
const elasticsearch = require('../elasticsearch');

// mongoQueryFromTalks :: [Talk] -> SpeakerQuery
const mongoQueryFromTalks = compose(speakers =>
    ({ handle: { $in: speakers } }), pluck('speaker'));

// findSpeakersFromTalks :: [Talk] -> Future Error [Speaker]
const findSpeakersFromTalks = compose(mongo.find('speakers'), mongoQueryFromTalks);

// addSpeakers :: [Talk] -> Future Error [TalkEmbeddedWithSpeaker]
const addSpeakers = talks =>
    compose(map(innerJoin('speaker', 'handle', talks)), findSpeakersFromTalks)(talks);

// parseResults :: {hits:{hits:[{_source:Talk}]}} -> [Talk]
const parseResults = compose(pluck('_source'), path(['hits', 'hits']));

// findTalks :: TalkQuery -> Future Error [Talk]
const findTalks = compose(map(parseResults), elasticsearch.search);

// search :: TalkQuery -> Future Error [TalkEmbeddedWithSpeaker]
const search = compose(chain(addSpeakers), findTalks);

module.exports = search