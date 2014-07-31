var fs = require('fs');

var expect = require('chai').expect;

var Board = require('../lib/board');

describe('board', function() {
  describe('from game description', function() {
    var game1000;

    before(function(done) {
      fs.readFile('test/games/1000.pgn', function(err, data) {
        if (err) {
          done(err);
        } else {
          game1000 = data.toString();
          done();
        }
      });
    });

    it('should parse basic metadata', function() {
      var b = Board.fromGame('GameId: 42\nEvent: Test game\n');
      expect(b.meta).to.deep.equal({GameId: 42, Event: 'Test game'});
    });

    it('should parse real metadata.', function() {
      var b = Board.fromGame(game1000);
      expect(b.meta).to.deep.equal({
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
  });
});
