// Computes the bounding box of the specified topology.
// The given topology must be in absolute coordinates.
module.exports = function(topology) {
  var arcs = topology.arcs,
      i,
      n = arcs.length,
      x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;

  for (i = 0; i < n; ++i) {
    var arc = arcs[i],
        j = -1,
        m = arc.length;
    while (++j < m) {
      var point = arc[j],
          x = point[0],
          y = point[1];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }

  return [x0, y0, x1, y1];
};
