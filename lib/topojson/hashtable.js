module.exports = function(size) {
  var hashtable = new Array(size = 1 << Math.ceil(Math.log(size) / Math.LN2));
  return {
    peek: function(point) {
      var key = Math.abs(hash(point)) % size,
          matches = hashtable[key];

      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.point, point)) {
            return match.values;
          }
        }
      }

      return null;
    },
    get: function(point) {
      var key = Math.abs(hash(point)) % size,
          matches = hashtable[key];

      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.point, point)) {
            return match.values;
          }
        }
      } else {
        matches = hashtable[key] = [];
      }

      var values = [];
      matches.push({point: point, values: values});
      return values;
    }
  };
};

var buffer = new ArrayBuffer(16),
    floats = new Float64Array(buffer),
    ints = new Int32Array(buffer);

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

function equal(pointA, pointB) {
  return pointA[0] === pointB[0]
      && pointA[1] === pointB[1];
}
