// TODO if the input topology is not quantized, then we should compute the
// bounding box of the topology and determine suitable scaling factors.
module.exports = function(topology, Q0, Q1) {

  function quantizeGeometry(geometry) {
    if (geometry && quantizeGeometryType.hasOwnProperty(geometry.type)) quantizeGeometryType[geometry.type](geometry);
  }

  var quantizeGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(quantizeGeometry); },
    Point: function(o) { quantizePoint(o.coordinates); },
    MultiPoint: function(o) { o.coordinates.forEach(quantizePoint); }
  };

  function quantizePoint(coordinates) {
    coordinates[0] = Math.round(coordinates[0] / Q);
    coordinates[1] = Math.round(coordinates[1] / Q);
  }

  function quantizeRelativeArc(arc) {

    // transform to absolute coordinates
    for (var i = 1, n = arc.length, p = arc[0], x = p[0], y = p[1]; i < n; ++i) {
      p = arc[i];
      x = (p[0] += x);
      y = (p[1] += y);
    }

    quantizeAbsoluteArc(arc);

    // transform back to relative coordinates
    for (var i = 1, n = arc.length, p = arc[0], x0 = p[0], y0 = p[1], x1, y1; i < n; ++i) {
      p = arc[i];
      x1 = p[0];
      y1 = p[1];
      p[0] -= x0;
      p[1] -= y0;
      x0 = x1;
      y0 = y1;
    }
  }

  function quantizeAbsoluteArc(arc) {
    var i = 0,
        j = 1,
        n = arc.length,
        pi = arc[0],
        pj,
        px = pi[0] = Math.round(pi[0] / Q),
        py = pi[1] = Math.round(pi[1] / Q),
        x,
        y;

    while (++i < n) {
      pi = arc[i];
      x = Math.round(pi[0] / Q);
      y = Math.round(pi[1] / Q);
      if (x !== px || y !== py) { // skip coincident points
        pj = arc[j++];
        pj[0] = px = x;
        pj[1] = py = y;
      }
    }

    arc.length = j;
  }

  for (var key in topology.objects) {
    quantizeGeometry(topology.objects[key]);
  }

  topology.arcs.forEach(Q0 ? quantizeRelativeArc : quantizeAbsoluteArc);

  return topology;
};
