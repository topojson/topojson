// Given a TopoJSON topology in absolute coordinates,
// quantizes the arcs and converts to fixed-point delta encoding.
// This is a destructive operation that modifies the given topology!
module.exports = function(topology, Q) {
  if (arguments.length < 2) Q = 1e4;

  var arcs = topology.arcs,
      i,
      n = arcs.length,
      x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;

  // First compute the bounding box.
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

  topology.bbox = [x0, y0, x1, y1];

  // Compute transform.
  var kx = x1 - x0 ? (Q - 1) / (x1 - x0) : 1;
      ky = y1 - y0 ? (Q - 1) / (y1 - y0) : 1;

  topology.transform = {
    scale: [1 / kx, 1 / ky],
    translate: [x0, y0]
  };

  // Apply quantization and delta-encoding.
  // TODO report quantization error
  for (i = 0; i < n; ++i) {
    var arc = arcs[i],
        j = -1,
        m = arc.length,
        px = 0,
        py = 0;
    while (++j < m) {
      var point = arc[j],
          x = Math.round((point[0] - x0) * kx),
          y = Math.round((point[1] - y0) * ky);
      point[0] = x - px;
      point[1] = y - py;
      px = x;
      py = y;
    }
  }

  return topology;
};
