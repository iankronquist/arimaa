var expect = require('chai').expect;

var utils = require('../lib/utils');

describe('utils', function() {
  describe('dirFromSquare', function() {

    it('should handle north', function() {
      expect(utils.dirFromSquare('b2', 'n')).to.equal('b3');
    });

    it('should handle east', function() {
      expect(utils.dirFromSquare('b2', 'e')).to.equal('c2');
    });

    it('should handle south', function() {
      expect(utils.dirFromSquare('b2', 's')).to.equal('b1');
    });

    it('should handle west', function() {
      expect(utils.dirFromSquare('b2', 'w')).to.equal('a2');
    });

    it('should handle captures', function() {
      expect(utils.dirFromSquare('b2', 'x')).to.equal(null);
    });

    it('should error if it goes off the board', function() {
      expect(utils.dirFromSquare.bind(null, 'h8', 'n')).to.throw(RangeError);
      expect(utils.dirFromSquare.bind(null, 'h8', 'e')).to.throw(RangeError);
      expect(utils.dirFromSquare.bind(null, 'a1', 's')).to.throw(RangeError);
      expect(utils.dirFromSquare.bind(null, 'a1', 'w')).to.throw(RangeError);
    });
  });
});
