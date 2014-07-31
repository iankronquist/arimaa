function Board() {
}

Board.fromGame = function(gameString) {
    var board = {meta: {}};

    var lines = gameString.split('\n');

    var line;
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

        board.meta[key] = val;
    }

    return board;
};

module.exports = Board;
