module.exports = {};

module.exports.dirFromSquare = function(square, direction) {
  if (!direction || direction === 'x') {
      return null;
  }
  var col = square.charCodeAt(0);
  var row = square.charCodeAt(1);
  var dirMap = {n: [0, 1], e: [1, 0], s: [0, -1], w: [-1, 0]};
  var step = dirMap[direction];
  var newCol = String.fromCharCode(col + step[0]);
  var newRow = String.fromCharCode(row + step[1]);
  if ('abcdefgh'.indexOf(newCol) === -1 ||
      '12345678'.indexOf(newRow) === -1) {
    throw new RangeError('Out of range.');
  }
  return newCol + newRow;
};

module.exports.range = function*(start, end) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  for (var i = start; i < end; i++) {
    yield i;
  }
};
