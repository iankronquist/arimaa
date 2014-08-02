var expect = require('chai').expect;

var utils = require('../src/utils');

describe('utils', () => {
  describe('dirFromSquare', () => {

    it('should handle north', () => {
      expect(utils.dirFromSquare('b2', 'n')).to.equal('b3');
    });

    it('should handle east', () => {
      expect(utils.dirFromSquare('b2', 'e')).to.equal('c2');
    });

    it('should handle south', () => {
      expect(utils.dirFromSquare('b2', 's')).to.equal('b1');
    });

    it('should handle west', () => {
      expect(utils.dirFromSquare('b2', 'w')).to.equal('a2');
    });

    it('should handle captures', () => {
      expect(utils.dirFromSquare('b2', 'x')).to.equal(null);
    });

    it('should error if it goes off the board', () => {
      expect(utils.dirFromSquare.bind(null, 'h8', 'n')).to.throw(RangeError);
      expect(utils.dirFromSquare.bind(null, 'h8', 'e')).to.throw(RangeError);
      expect(utils.dirFromSquare.bind(null, 'a1', 's')).to.throw(RangeError);
      expect(utils.dirFromSquare.bind(null, 'a1', 'w')).to.throw(RangeError);
    });
  });

  describe('range', () => {
    it('should work with two args', () => {
      var acc = [];
      for (var n of utils.range(0, 5)) {
        acc.push(n);
      }
      expect(acc).to.deep.equal([0, 1, 2, 3, 4]);
    });

    it('should be inclusive if the third param is true', () => {
      var acc = [];
      for (var n of utils.range(0, 5, true)) {
        acc.push(n);
      }
      expect(acc).to.deep.equal([0, 1, 2, 3, 4, 5]);
    });

    it('should work with characters', () => {
      var acc = '';
      for (var c of utils.range('a', 'e', true)) {
        acc += c;
      }
      expect(acc).to.equal('abcde');
    });
  });
});
