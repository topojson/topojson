var type = require("./type");

module.exports = function(objects) {
  return new PointStore(objects);
};

function PointStore(objects) {
  var x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity,
      kx,
      ky,
      n = 1e4, // precision of quantification
      k = 0, // number of unique points
      m = 0, // number of total points
      points = new Array(n * n);

  var bound = type({
    point: function(point) {
      var x = point[0],
          y = point[1];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  });

  var add = type({
    line: function(line) {
      var i = -1,
          n = line.length;
      while (++i < n) {
        var point = line[i],
            x = (point[0] - x0) * kx | 0,
            y = (point[1] - y0) * ky | 0,
            j = y * n + x;
        if (!points[j]) {
          points[j] = 1;
          ++k;
        }
        ++m;
      }
    }
  });

  objects.forEach(function(o) { bound.object(o); });

  kx = n / (x1 - x0);
  ky = n / (y1 - y0);

  objects.forEach(function(o) { add.object(o); });

  console.warn(k + " / " + m + " unique points");
}
