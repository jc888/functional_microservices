const { map } = require('ramda');

const chai = require('chai');
const expect = chai.expect;

const search = require('../handlers/search');

describe('Search module', function() {
    it('mongoQueryFromTalks fn should transform speakers', function() {
        var obj = search.mongoQueryFromTalks([{
            speaker: "TestName"
        }]);
        expect(obj).to.have.property('handle');
        expect(obj.handle).to.have.property('$in');
    });
});
