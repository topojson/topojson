var type = require("./type");

module.exports = function(objects, Q) {
  var x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity,
      kx,
      ky,
      coincidences = [],
      arcs = [],
      arcsByIndex = [];

  if (arguments.length < 2) Q = 1e4; // precision of quantization

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
          if (coincidences[j]) coincidences[j].push(line);
          else coincidences[j] = [line];
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
        if (p && p.length < t.length) break;
        p = t;
      }

      for (var i = 0; i <= n; ++i) {
        var point = line[(i + k) % n],
            x = (point[0] - x0) * kx | 0,
            y = (point[1] - y0) * ky | 0,
            j = y * Q + x,
            p = coincidences[j];
        if (!equal(p, t)) {
          var tInP = t.every(function(line) { return p.indexOf(line) >= 0; }),
              pInT = p.every(function(line) { return t.indexOf(line) >= 0; });
          if (tInP) a.push(j);
          if (!tInP && !pInT) arc([a[a.length - 1], j]);
          arc(a);
          if (pInT) a = [a[a.length - 1]];
          else a = [];
        }
        if (a[a.length - 1] !== j) a.push(j); // skip duplicate points
        t = p;
      }

      arc(a);
    }
  });

  function equal(a, b) {
    var n = a.length, i = -1;
    if (b.length !== n) return false;
    while (++i < n) if (a[i] !== b[i]) return false;
    return true;
  }

  function arc(a) {
    var n = a.length;

    if (n > 1) {
      var i = a[0],
          j = a[n - 1],
          indexArcs = arcsByIndex[Math.min(i, j)];

      if (indexArcs) {
        if (indexArcs.some(matchForward) || indexArcs.some(matchBackward)) return;
        indexArcs.push(a);
      } else {
        arcsByIndex[Math.min(i, j)] = [a];
      }

      arcs.push(a);
    }

    function matchForward(b) {
      var i = -1;
      if (b.length !== n) return false;
      while (++i < n) if (a[i] !== b[i]) return false;
      return true;
    }

    function matchBackward(b) {
      var i = -1;
      if (b.length !== n) return false;
      while (++i < n) if (a[i] !== b[n - i - 1]) return false;
      return true;
    }
  }

  return {
    type: "Topology",
    transform: {
      scale: [1 / kx, 1 / ky],
      translate: [x0, y0]
    },
    coordinates: arcs.map(function(arc) {
      return arc.map(function(index) {
        var y = Math.floor(index / Q),
            x = index - y * Q;
        return [x, y];
      });
    })
  };
};
