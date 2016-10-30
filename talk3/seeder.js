const { addIndex, sequence, assoc, compose, map, tap, chain, objOf } = require('ramda');
const { Future } = require('ramda-fantasy');
const logger = require('./lib/logger');

var demoSpeakers = [{
    name: "james",
    surname: "chow",
    title: "devops"
}, {
    name: "steffano",
    surname: "vozza",
    title: "developer"
}, {
    name: "andreas",
    surname: "moller",
    title: "developer"
}];

var demoTalks = [{
    title: "functional for the win",
    description: "the basic building blocks of functional programming",
    speaker: "andreas"
}, {
    title: "Papas brand new functional bag",
    description: "And why null can't hurt you",
    speaker: "steffano"
}, {
    title: "Microservices and how functional can help",
    description: "I couldn't come up with a witty description",
    speaker: "james"
}]

const mongoSpeakers = require('./mongoSpeakers');

var elasticsearch = require('./elasticsearch');

var elasticSearchDocumentify = (index, type) => compose(
    map(assoc('index', index)),
    map(assoc('type', type)),
    addIndex(map)((val, idx) => assoc('id', idx, val)),
    map(objOf('body'))
)

var delay = time => v => Future((reject, resolve) => setTimeout(() => resolve(v), time));

module.exports = compose(
    chain(delay(200)),
    map(tap(v => console.log('mongo seed complete'))),
    chain(() => mongoSpeakers.insert(demoSpeakers)),
    chain(() => mongoSpeakers.remove({})),
    map(tap(v => console.log('elasticsearch seed complete'))),
    sequence(Future.of),
    map(elasticsearch.upsert),
    elasticSearchDocumentify('function_microservices', 'function_microservices')
)(demoTalks);
