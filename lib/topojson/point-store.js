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
      Q = 1e4, // precision of quantification
      coincidences = [],
      arcs = [];

  function each(callback) {
    var t = type(callback);
    objects.forEach(function(o) { t.object(o); });
  }

  // Compute bounding box.
  each({
    point: function(point) {
      var x = point[0],
          y = point[1];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  });

  // Compute quantization scaling factors.
  kx = (Q - 1) / (x1 - x0);
  ky = (Q - 1) / (y1 - y0);

  //
  each({
    line: function(line) {
      var i = -1,
          n = line.length,
          a = [];
      while (++i < n) {
        var point = line[i],
            x = (point[0] - x0) * kx | 0,
            y = (point[1] - y0) * ky | 0,
            j = y * Q + x;
        if (!a[j]) {
          coincidences[j] = (coincidences[j] || 0) + 1;
          a[j] = 1;
        }
      }
    }
  });

  //
  each({
    line: function(line) {
      var n = line.length,
          a = [],
          k = 0,
          p;

      // Rotate to find a shared starting point, if any.
      for (; k < n; ++k) {
        var point = line[k],
            x = (point[0] - x0) * kx | 0,
            y = (point[1] - y0) * ky | 0,
            j = y * Q + x,
            t = coincidences[j];
        if (p && p < t) break;
        p = t;
      }

      for (var i = 0; i <= n; ++i) {
        var point = line[(i + k) % n],
            x = (point[0] - x0) * kx | 0,
            y = (point[1] - y0) * ky | 0,
            j = y * Q + x,
            p = coincidences[j];
        if (p !== t) {
          if (p > t) a.push(j);
          if (a.length > 1) arcs.push(a);
          a = [a[a.length - 1]];
        }
        a.push(j);
        t = p;
      }

      if (a.length > 1) arcs.push(a);
    }
  });

  return {
    type: "GeometryCollection",
    geometries: arcs.map(function(arc) {
      return {
        type: "LineString",
        coordinates: arc.map(function(index) {
          var y = Math.floor(index / Q),
              x = index - y * Q;
          return [x / kx + x0, y / ky + y0];
        })
      };
    })
  };
}
