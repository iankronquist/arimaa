var fs = require('fs');

var expect = require('chai').expect;

var Board = require('../lib/board');

describe('board', function() {
  describe('from game description', function() {
    var game1000Text;
    var game1000;

    before(function(done) {
      fs.readFile('test/games/1000.pgn', function(err, data) {
        if (err) {
          done(err);
        } else {
          game1000Text = data.toString();
          done();
        }
      });
    });

    beforeEach(function() {
      game1000 = Board.fromGame(game1000Text);
    });

    function stepListPluck(game, move, key) {
      return game.moves[move].steps.map(function(s) { return s[key]; });
    }

    it('should parse basic metadata', function() {
      var b = Board.fromGame('GameId: 42\nEvent: Test game\n');
      expect(b.meta).to.deep.equal({GameId: 42, Event: 'Test game'});
    });

    it('should parse real metadata.', function() {
      expect(game1000.meta).to.deep.equal({
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

    it('should have the right number of moves.', function() {
      expect(game1000.moves.length).to.equal(56);
    });

    /* Excerpt of game 1000's moves, used in the below tests.
     *
     * 1w Ee2 Md2 Da1 Hb2 Dh1 Hg2 Cf1 Cc1 Rb1 Rd1 Re1 Rg1 Ra2 Rc2 Rf2 Rh2
     * 1b ee7 md7 ha7 hh7 db7 dg7 cf8 cc8 rc7 rf7 ra8 rb8 rd8 re8 rg8 rh8
     * 2w Hg2n Md2n Rh2n
     * 2b db7s ha7s rf7s rf6x rc7s
     * 3w Hg3s Hb2n Ee2n Rh3n
     * 3b dg7s dg6w df6x md7s rc6s
     */

    it('should have the right move ids.', function() {
      expect(game1000.moves[0].id).to.equal('1w');
      expect(game1000.moves[1].id).to.equal('1b');
      expect(game1000.moves[2].id).to.equal('2w');
      expect(game1000.moves[3].id).to.equal('2b');
    });

    it('should have the right number of move steps.', function() {
      expect(game1000.moves[0].steps.length).to.equal(16);
      expect(game1000.moves[1].steps.length).to.equal(16);
      expect(game1000.moves[2].steps.length).to.equal(3);
      expect(game1000.moves[3].steps.length).to.equal(5);
      expect(game1000.moves[4].steps.length).to.equal(4);
      expect(game1000.moves[5].steps.length).to.equal(5);
    });

    it('should have the right piece codes.', function() {
      expect(stepListPluck(game1000, 2, 'pieceCode')).to.deep.equal(['H', 'M', 'R']);
      expect(stepListPluck(game1000, 3, 'pieceCode')).to.deep.equal(['d', 'h', 'r', 'r', 'r']);
      expect(stepListPluck(game1000, 4, 'pieceCode')).to.deep.equal(['H', 'H', 'E', 'R']);
      expect(stepListPluck(game1000, 5, 'pieceCode')).to.deep.equal(['d', 'd', 'd', 'm', 'r']);
    });

    it('should have the right starting positions.', function() {
      expect(stepListPluck(game1000, 2, 'from')).to.deep.equal(['g2', 'd2', 'h2']);
      expect(stepListPluck(game1000, 3, 'from')).to.deep.equal(['b7', 'a7', 'f7', 'f6', 'c7']);
      expect(stepListPluck(game1000, 4, 'from')).to.deep.equal(['g3', 'b2', 'e2', 'h3']);
      expect(stepListPluck(game1000, 5, 'from')).to.deep.equal(['g7', 'g6', 'f6', 'd7', 'c6']);
    });

    it('should have the right directions.', function() {
      expect(stepListPluck(game1000, 2, 'direction')).to.deep.equal(['n', 'n', 'n']);
      expect(stepListPluck(game1000, 3, 'direction')).to.deep.equal(['s', 's', 's', 'x', 's']);
      expect(stepListPluck(game1000, 4, 'direction')).to.deep.equal(['s', 'n', 'n', 'n']);
      expect(stepListPluck(game1000, 5, 'direction')).to.deep.equal(['s', 'w', 'x', 's', 's']);
    });
  });
});
