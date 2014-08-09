var utils = require('./utils');


function Board(meta, moves) {
  this.meta = meta || {};
  this.moves = moves || [];
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

  this._simulate();
}

Board.prototype._simulate = function() {
  for (var move of this.moves) {
    for (var step of move.steps) {
      if (!step.from && step.to && !step.direction) {
        // placement
        this.at(step.to).piece = step.piece;
      } else if (step.from && step.to && 'nsew'.indexOf(step.direction) !== -1) {
        // Move
        var piece = this.at(step.from).piece;
        this.at(step.to, piece);
        this.at(step.from, null);
      } else if (step.from && !step.to && step.direction === 'x') {
        // Capture
        this.at(step.from, null);
      } else {
        throw new Error("Unknown kind of step: " + JSON.stringify(step));
      }
    }
 }
};

Board.prototype.iterate = function(cb) {
  var cols = 'abcdefgh';
  var i, row, col;
  var count = 0;
  for (row = 1; row <= 8; row++) {
    for (i = 0; i < cols.length; i++) {
      col = cols[i];
      cb(this.state[col][row], count++);
    }
  }
};

Board.prototype.at = function(squareCode, newPiece) {
  if (!squareCode || !squareCode.match || !squareCode.match(/[a-h][1-8]/)) {
    throw new RangeError('invalid square code given: "' + squareCode + '"');
  }
  var col = squareCode[0];
  var row = squareCode[1];
  var square = this.state[col][row];
  if (newPiece === undefined) {
    // getter
    return square;
  } else {
    // setter
    square.piece = newPiece;
  }
}

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
      var piece = stepString[0];
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
        piece: piece,
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
