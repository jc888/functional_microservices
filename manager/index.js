var Bus = require('busmq');
var hl = require('highland');
var R = require('ramda');

/*
hl([{ redis: 'redis://127.0.0.1:6379' }])
    .map(Bus.create)
    .tap(bus => bus.connect())
    .flatMap(bus => hl('online', bus).map(() => bus))
    .map(bus => bus.pubsub('broker'))
    .tap(s => s.subscribe())
    .flatMap(s => hl('message', s))
    .map(JSON.parse)
    .filter(R.propSatisfies(R.test(/^d/), 'type'))
    .each(console.log);

hl([{ redis: 'redis://127.0.0.1:6379' }])
    .map(Bus.create)
    .tap(bus => bus.connect())
    .flatMap(bus => hl('online', bus).map(() => bus))
    .map(bus => bus.pubsub('broker'))
    .tap(s => s.subscribe())
    .flatMap(s => hl('message', s))
    .map(JSON.parse)
    .filter(R.propSatisfies(R.test(/^f/), 'type'))
    .map(R.assoc('things', 'stuff'))
    .each(console.log);

hl([{ redis: 'redis://127.0.0.1:6379' }])
    .map(Bus.create)
    .tap(bus => bus.connect())
    .flatMap(bus => hl('online', bus).map(() => bus))
    .map(bus => bus.pubsub('broker'))
    .map(s => s.publish({ type: 'dibble', msg: 'hellos' }))
    .each(() => {});

hl([{ redis: 'redis://127.0.0.1:6379' }])
    .map(Bus.create)
    .tap(bus => bus.connect())
    .flatMap(bus => hl('online', bus).map(() => bus))
    .map(bus => bus.pubsub('broker'))
    .map(s => s.publish({ type: 'flibble', msg: 'hello' }))
    .each(() => {});
*/

hl([{ redis: 'redis://127.0.0.1:6379' }])
    .map(Bus.create)
    .tap(bus => bus.connect())
    .flatMap(bus => hl('online', bus).map(() => bus))
    .map(bus => bus.queue('mainQ'))
    .tap(q => q.attach())
    .flatMap(q => hl('attached', q).map(() => q))
    .tap(q => q.push({ type: 'AChannel', msg: 'a channel msg' }))
    .tap(q => q.push({ type: 'BChannel', msg: 'b channel msg' }))
    .tap(q => q.push({ type: 'BChannel', msg: 'b channel 2nd msg' }))
    .each(() => {});


hl([{ redis: 'redis://127.0.0.1:6379' }])
    .map(Bus.create)
    .tap(bus => bus.connect())
    .flatMap(bus => hl('online', bus).map(() => bus))
    .map(bus => bus.queue('mainQ'))
    .tap(q => q.attach())
    .flatMap(q => hl('attached', q).map(() => q))
    .tap(q => q.consume({ reliable: true }))
    .flatMap(q => hl((push, next) => {
        q.on('message', (message, id) => {
            push(null, [message, id, q]);

        });
    }))
    .map(R.applySpec({
        msg: R.nth(0),
        id: R.nth(1),
        queue: R.nth(2)
    }))
    .filter(R.propSatisfies(R.test(/BChannel/), 'msg'))
    .tap(x => x.queue.ack(x.id))
    .map(R.prop('msg'))
    .map(JSON.parse)
    .map(R.prop('msg'))
    .each(console.log);


hl([{ redis: 'redis://127.0.0.1:6379' }])
    .map(Bus.create)
    .tap(bus => bus.connect())
    .flatMap(bus => hl('online', bus).map(() => bus))
    .map(bus => bus.queue('mainQ'))
    .tap(q => q.attach())
    .flatMap(q => hl('attached', q).map(() => q))
    .tap(q => q.consume({ reliable: true }))
    .flatMap(q => hl((push, next) => {
        q.on('message', (message, id) => {
            push(null, [message, id, q]);
        });
    }))
    .map(R.applySpec({
        msg: R.nth(0),
        id: R.nth(1),
        queue: R.nth(2)
    }))
    .filter(R.propSatisfies(R.test(/AChannel/), 'msg'))
    .tap(x => x.queue.ack(x.id))
    .map(R.prop('msg'))
    .map(JSON.parse)
    .map(R.prop('msg'))
    .each(console.log);
