var buffer = new ArrayBuffer(16),
    floats = new Float64Array(buffer),
    ints = new Int32Array(buffer);

// Note: requires that size is a power of two!
module.exports = function(size) {
  var mask = size - 1;
  return function(point) {
    var key = hash(point);
    return (key < 0 ? ~key : key) & mask;
  };
};

function hash(point) {
  var x, y;

  floats[0] = point[0];
  floats[1] = point[1];

  x = ints[0] ^ ints[1];
  y = ints[2] ^ ints[3];

  x ^= (x >>> 20) ^ (x >>> 12);
  x ^= (x >>> 7) ^ (x >>> 4);
  y ^= (y >>> 20) ^ (y >>> 12);
  y ^= (y >>> 7) ^ (y >>> 4);

  return (x + 31 * y) | 0;
}
