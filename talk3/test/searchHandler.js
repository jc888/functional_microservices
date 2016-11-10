const { map } = require('ramda');
const { Future } = require('ramda-fantasy');
const rewire = require('rewire');
const mod = rewire('../searchHandler');
const sinon = require('sinon');

var fakeData = [{
    name: 'james',
    surname: 'chow',
    title: 'devops'
}, {
    name: 'steffano',
    surname: 'vozza',
    title: 'developer'
}, {
    name: 'andreas',
    surname: 'moller',
    title: 'developer'
}];

var fakeElasticSearch = {
    hits: {
        hits: []
    }
};


describe('GET /', function() {
    before(() => {
        mod.__set__('mongoFind', sinon.stub().returns(Future.of(fakeData)));
        mod.__set__('search', sinon.stub().returns(Future.of(fakeElasticSearch)));
    })
    after(() => {
        console.log(mod.__get__('mongoFind').callCount);
    })
    it('respond with json', function(done) {
        mod({ q: 'functional' })
            .fork(done, v => done());
    });
});
