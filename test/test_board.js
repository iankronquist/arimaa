var fs = require('fs');
var _ = require('lodash');

var expect = require('chai').expect;

var Board = require('../src/board');
var {range} = require('../src/utils');

describe('Board', () => {

  describe('constructor', () => {
    it('should have state with square codes', () => {
      var b = new Board();
      expect(_.pluck(b.state.a, 'code')).to.deep.equal([for (n of range(1, 9)) 'a' + n]);
      expect(_.pluck(b.state.b, 'code')).to.deep.equal([for (n of range(1, 9)) 'b' + n]);
    });
  });


  describe('::iterate', () => {
    it('should syncronously iterate over the entire board', () => {
      var b = new Board({}, []);
      var count = 0;
      b.iterate(function() {
        count++;
      });
      expect(count).to.equal(64);
    });

    it('should iterate in row major order', () => {
      var b = new Board();
      var expected = ['a1', 'b1', 'c1'];
      b.iterate((square) => {
        var code = expected.shift();
        if (code) {
          expect(square.code).to.equal(code);
        }
      });
    });

    it('should pass indexes as the second argument', () => {
      var b = new Board();
      var count = 0;
      b.iterate((_, i) => {
        expect(i).to.equal(count);
        count++;
      });
    });
  });


  describe('::at', () => {
    it('should return the square asked for', () => {
      var b = new Board();
      expect(b.at('a1')).to.deep.equal({
        code: 'a1',
        piece: null,
      });
    });

    it('should throw an error if the squareCode is invalid', () => {
      var b = new Board();
      expect(b.at.bind(b, 'a9')).to.throw(RangeError);
      expect(b.at.bind(b, null)).to.throw(RangeError);
      expect(b.at.bind(b, 'a')).to.throw(RangeError);
      expect(b.at.bind(b, '9')).to.throw(RangeError);
      expect(b.at.bind(b, ['a', 9])).to.throw(RangeError);
      expect(b.at.bind(b, 9)).to.throw(RangeError);
    });

    it('should set a square if passed two arguments', () => {
      var b = new Board();
      expect(b.at('a1').piece).to.equal(null);
      b.at('a1', 'e');
      expect(b.at('a1').piece).to.equal('e');
    });

    it('should be able to set null', () => {
      var b = new Board();
      b.at('a1', 'e');
      expect(b.at('a1').piece).to.equal('e');
      b.at('a1', null);
      expect(b.at('a1').piece).to.equal(null);
    });
  });


  describe('::_simulate', () => {
    it('should simulate placing pieces from the first turn', () => {
      // One move for white, placing the pieces.
      var b = Board.fromGame('\n1w 0a1 1b1 2c1 3d1 4e1 5f1 6g1 7h1 8a2 9b2 Ac2 Bd2 Ce2 Df2 Eg2 Fh2');
      var squares = [for (row of [1, 2]) for (col of range('a', 'h', true)) col + row];
      var pieces = [for (square of squares) b.at(square).piece].join('');
      expect(pieces).to.deep.equal('0123456789ABCDEF');
    });

    it('should simulate both of the placement turns', () => {
      // One move for both sides, placing the pieces.
      var b = Board.fromGame('\n1w Ee2 Md2 Da1 Hb2 Dh1 Hg2 Cf1 Cc1 Rb1 Rd1 Re1 Rg1 Ra2 Rc2 Rf2 Rh2\n' +
                               '1b ee7 md7 ha7 hh7 db7 dg7 cf8 cc8 rc7 rf7 ra8 rb8 rd8 re8 rg8 rh8');
      // pieces that don't have a square won't contribute to the string, since they have piece=null
      var squares = [for (row of range(1, 8, true)) for (col of range('a', 'h', true)) col + row];
      var pieces = [for (square of squares) b.at(square).piece].join('');
      expect(pieces).to.deep.equal('DRCRRCRDRHRMERHRhdrmerdhrrcrrcrr');
    });

    it('should simulate pieces moving', () => {
      // Place a piece in the middle, and then move it north.
      var b = Board.fromGame('\n1w Rd4 Ce4 Dd3 He3\n' + '1b\n' +
                             '2w Rd4n Re4e Dd3w He3s');
      expect(b.at('d4').piece).to.be.null;
      expect(b.at('e4').piece).to.be.null;
      expect(b.at('d3').piece).to.be.null;
      expect(b.at('e3').piece).to.be.null;

      expect(b.at('d5').piece).to.equal('R');
      expect(b.at('f4').piece).to.equal('C');
      expect(b.at('c3').piece).to.equal('D');
      expect(b.at('e2').piece).to.equal('H');
    });

    it('should simulate a piece being captured', () => {
      var b = Board.fromGame('\n1w Rc2\n' + '1b\n' +
                             '2w Rc2n Rc3x');
      expect(b.at('c2').piece).to.be.null;
      expect(b.at('c3').piece).to.be.null;
    });
  });

  describe('fromGame', () => {

    describe('artificial tests', () => {

      it('should parse basic metadata', () => {
        var b = Board.fromGame('GameId: 42\nEvent: Test game\n');
        expect(b.meta).to.deep.equal({GameId: 42, Event: 'Test game'});
      });

    });

    describe('game 100 tests', () => {

      var game100Text;
      var game100;

      before(function(done) {
        fs.readFile('test/games/100.pgn', function(err, data) {
          if (err) {
            done(err);
          } else {
            game100Text = data.toString();
            done();
          }
        });
      });

      beforeEach(function() {
        game100 = Board.fromGame(game100Text);
      });

      it('should parse real metadata', () => {
        expect(game100.meta).to.deep.equal({
          GameId: 100,
          Event: 'Casual game',
          Site: 'Over the Net',
          Date: new Date(2003, 0, 26),
          White: 'bot_Occam (Don Dailey)',
          Black: 'bot_ShallowBlue (Omar Syed)',
          Result: '0-1',
          Reason: 'Goal',
          ResultCode: 'b',
          ReasonCode: 'g',
          PlyCount: 28,
        });
      });

      it('should have the right number of moves', () => {
        expect(game100.moves.length).to.equal(56);
      });

      /* Excerpt of game 100's moves, used in the below tests.
       *
       * 0:  1w Ee2 Md2 Da1 Hb2 Dh1 Hg2 Cf1 Cc1 Rb1 Rd1 Re1 Rg1 Ra2 Rc2 Rf2 Rh2
       * 1:  1b ee7 md7 ha7 hh7 db7 dg7 cf8 cc8 rc7 rf7 ra8 rb8 rd8 re8 rg8 rh8
       * 2:  2w Hg2n Md2n Rh2n
       * 3:  2b db7s ha7s rf7s rf6x rc7s
       * 4:  3w Hg3s Hb2n Ee2n Rh3n
       * 5:  3b dg7s dg6w df6x md7s rc6s
       */

      it('should have the right move ids', () => {
        expect(game100.moves[0].id).to.equal('1w');
        expect(game100.moves[1].id).to.equal('1b');
        expect(game100.moves[2].id).to.equal('2w');
        expect(game100.moves[3].id).to.equal('2b');
      });

      it('should have the right number of move steps', () => {
        expect(game100.moves[0].steps.length).to.equal(16);
        expect(game100.moves[1].steps.length).to.equal(16);
        expect(game100.moves[2].steps.length).to.equal(3);
        expect(game100.moves[3].steps.length).to.equal(5);
        expect(game100.moves[4].steps.length).to.equal(4);
        expect(game100.moves[5].steps.length).to.equal(5);
      });

      it('should have the right piece codes', () => {
        expect(_.pluck(game100.moves[2].steps, 'piece')).to.deep.equal(['H', 'M', 'R']);
        expect(_.pluck(game100.moves[3].steps, 'piece')).to.deep.equal(['d', 'h', 'r', 'r', 'r']);
        expect(_.pluck(game100.moves[4].steps, 'piece')).to.deep.equal(['H', 'H', 'E', 'R']);
        expect(_.pluck(game100.moves[5].steps, 'piece')).to.deep.equal(['d', 'd', 'd', 'm', 'r']);
      });

      it('should have the right starting positions', () => {
        expect(_.pluck(game100.moves[2].steps, 'from')).to.deep.equal(['g2', 'd2', 'h2']);
        expect(_.pluck(game100.moves[3].steps, 'from')).to.deep.equal(['b7', 'a7', 'f7', 'f6', 'c7']);
        expect(_.pluck(game100.moves[4].steps, 'from')).to.deep.equal(['g3', 'b2', 'e2', 'h3']);
        expect(_.pluck(game100.moves[5].steps, 'from')).to.deep.equal(['g7', 'g6', 'f6', 'd7', 'c6']);
      });

      it('should have the right directions', () => {
        expect(_.pluck(game100.moves[2].steps, 'direction')).to.deep.equal(['n', 'n', 'n']);
        expect(_.pluck(game100.moves[3].steps, 'direction')).to.deep.equal(['s', 's', 's', 'x', 's']);
        expect(_.pluck(game100.moves[4].steps, 'direction')).to.deep.equal(['s', 'n', 'n', 'n']);
        expect(_.pluck(game100.moves[5].steps, 'direction')).to.deep.equal(['s', 'w', 'x', 's', 's']);
      });

      it('should have the right destination positions', () => {
        expect(_.pluck(game100.moves[2].steps, 'to')).to.deep.equal(['g3', 'd3', 'h3']);
        expect(_.pluck(game100.moves[3].steps, 'to')).to.deep.equal(['b6', 'a6', 'f6', null, 'c6']);
        expect(_.pluck(game100.moves[4].steps, 'to')).to.deep.equal(['g2', 'b3', 'e3', 'h4']);
        expect(_.pluck(game100.moves[5].steps, 'to')).to.deep.equal(['g6', 'f6', null, 'd6', 'c5']);
      });

    });
  });
});
