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
  });


	describe('::_simulate', () => {
		describe('artificial tests', () => {
			it('should place the pieces',  () => {
				var firstMove = ['Db1', 'Ra1', 'Rc1', 'Rd1', 'Re1', 'Rf1', 'Dg1',
					'Rh1', 'Ha2', 'Rb2', 'Cc2', 'Ed2', 'Me2', 'Cf2', 'Rg2', 'Hh2'];
				var expectedDataA = ['R', 'D', 'R', 'R', 'R', 'R', 'R', 'D'];
				var expectedDataB = ['R', 'G', 'R', 'C', 'E', 'M', 'C', 'H'];
				var b = new Board({}, firstMove);
				b._simulate();
				expect(_.pluck(b.state.a, 'piece')).to.deep.equal(expectedDataA);
				expect(_.pluck(b.state.b, 'piece')).to.deep.equal(expectedDataB);
			});

			it('should increment _simulatedUntil', () => {
				var firstMove = ['Db1', 'Ra1', 'Rc1', 'Rd1', 'Re1', 'Rf1', 'Dg1',
					'Rh1', 'Ha2', 'Rb2', 'Cc2', 'Ed2', 'Me2', 'Cf2', 'Rg2', 'Hh2'];
				var b = new Board({}, firstMove);
				b._simulate();
				expect(b._simulatedUntil).to.equal(1);
			});
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
        expect(_.pluck(game100.moves[2].steps, 'pieceCode')).to.deep.equal(['H', 'M', 'R']);
        expect(_.pluck(game100.moves[3].steps, 'pieceCode')).to.deep.equal(['d', 'h', 'r', 'r', 'r']);
        expect(_.pluck(game100.moves[4].steps, 'pieceCode')).to.deep.equal(['H', 'H', 'E', 'R']);
        expect(_.pluck(game100.moves[5].steps, 'pieceCode')).to.deep.equal(['d', 'd', 'd', 'm', 'r']);
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
