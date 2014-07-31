var utils = require('./utils');


function Board(meta, moves) {
  this.meta = meta;
  this.moves = moves;
  this._simulatedUntil = 0;
  this.state = {};

  var cols = 'abcdefgh';
  var col;
  for (var i = 0; i < cols.length; i++) {
    col = cols[i];
    this.state[col] = {};
    for (var row = 1; row <= 8; row++) {
      this.state[col][row] = {
        code: col + row,
        piece: null,
      };
    }
  }
}

Board.prototype._simulate = function(moves) {
};

Board.prototype.iterate = function(cb) {
  var cols = 'abcdefgh';
  var col;
  for (var i = 0; i < cols.length; i++) {
    col = cols[i];
    for (var row = 1; row <= 8; row++) {
      cb(this.state[col][row]);
    }
  }
};

Board.fromGame = function(gameString) {
  var lines = gameString.split('\n');
  var line, parts;

  // Read metadata until the first blank line, or the end of the file.
  var meta = {};
  for (var i = 0; lines[i]; i++) {
    line = lines[i];
    var colonIndex = line.indexOf(': ');
    var key = line.slice(0, colonIndex);
    var val = line.slice(colonIndex + 2);

    var match = val.match(/(\d{4}).(\d{2}).(\d{2})/);
    if (val.match(/^\d+$/)) {
      val = parseInt(val);
    }
    if (key === 'Date' && match) {
      val = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }

    meta[key] = val;
  }

  // Read moves until the next blank line, or the end of the file.
  var moves = [];
  for(i = i + 1; lines[i]; i++) {
    parts = lines[i].split(' ');
    var stepStrings = parts.slice(1);
    var steps = parts.slice(1).map(function(stepString) {
      var pieceCode = stepString[0];
      var from = stepString.slice(1, 3);
      var direction = stepString[3] || null;
      var to;
      if (direction === null) {
        to = from;
        from = null;
      } else {
        to = utils.dirFromSquare(from, direction);
      }
      return {
        pieceCode: pieceCode,
        from: from,
        to: to,
        direction: direction,
      };
    });
    moves.push({
      id: parts[0],
      steps: steps,
    });
  }

  return new Board(meta, moves);
};

module.exports = Board;
