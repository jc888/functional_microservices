const convey = require('./lib/messaging/convey');
const dispatcher = require('./lib/messaging/dispatcher');
const { merge, objOf, compose, map, tap, chain, assocPath, prop } = require('ramda');
const { Future } = require('ramda-fantasy');
const { findTalks, findSpeakersWithResult, joinSpeakersWithSearchResult } = require('./searchHandler');

convey('elasticsearch', 'mongo', findTalks);

convey('mongo', 'joiner', findSpeakersWithResult);

convey('joiner', 'broker', compose(Future.of,joinSpeakersWithSearchResult));
