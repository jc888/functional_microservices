const { addIndex, match, pluck, curry, filter, test, reduce, sequence, assoc, compose, map, tap, chain, objOf, prop } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('./lib/logger');
const request = require('request-json');
const futureFromPromise = require('./lib/futureFromPromise');

var elasticsearch = require('./elasticsearch');
var mongo = require('./mongo');

var requestFn = curry((url, endpoint) => compose(
    map(prop('body')),
    futureFromPromise,
    client => () => client.get(endpoint),
    request.createClient
)(url))

var elasticSearchDocumentify = (index, type) => compose(
    map(assoc('index', index)),
    map(assoc('type', type)),
    addIndex(map)((val, idx) => assoc('id', idx, val)),
    map(objOf('body'))
)

var mapOverSpeakers = curry((event, acc, speaker) => {
    var v = assoc('date', event.date, speaker);
    acc.push(v);
    return acc;
});

var mapOverEvents = (acc, event) => reduce(mapOverSpeakers(event), acc, event.speakers);

var talksFromEvents = reduce(mapOverEvents, []);

var fetchFromGithub = compose(
    requestFn('https://api.github.com/'),
    logger('user'),
    x => 'users/' + x[1],
    match(/(?:https\:\/\/github.com\/)(.*)/),
    prop('url')
)

var getGithubInfo = compose(
    chain(mongo.insert('speakers')),
    map(logger('inserted users')),
    sequence(Future.of),
    map(fetchFromGithub)
)

var upsertAndReturn = val => compose(
    map(() => val),
    elasticsearch.upsert
)(val);

var filterForGithub = filter(
    compose(
        test(/github/),
        prop('url')
    )
)

var delay = time => v => Future((reject, resolve) => setTimeout(() => resolve(v), time));

var storeTalks = compose(
    sequence(Future.of),
    map(upsertAndReturn),
    elasticSearchDocumentify('lnug_speakers', 'lnug_speakers'),
    talksFromEvents
)

var storeSpeakers = compose(
    getGithubInfo,
    filterForGithub,
    pluck('body')
)

module.exports = compose(
    chain(delay(200)),
    map(tap(v => console.log('mongo seed complete'))),
    chain(storeSpeakers),
    map(tap(v => console.log('elasticsearch seed complete'))),
    chain(storeTalks),
    () => requestFn('https://raw.githubusercontent.com/', 'lnug/website/master/data/archive.json')
)();
