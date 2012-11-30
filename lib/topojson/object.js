module.exports = function(topology, o) {
  var tf = topology.transform,
      kx = tf.scale[0],
      ky = tf.scale[1],
      dx = tf.translate[0],
      dy = tf.translate[1],
      arcs = topology.arcs;

  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, x = 0, y = 0, p; k < n; ++k) points.push([
      (x += (p = a[k])[0]) * kx + dx,
      (y += p[1]) * ky + dy
    ]);
    if (i < 0) reverse(points, n);
  }

  function line(arcs) {
    var points = [];
    for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
    return points;
  }

  function polygon(arcs) {
    return arcs.map(line);
  }

  function geometry(o) {
    return {type: o.type, id: o.id, coordinates: geometryType[o.type](o.arcs)};
  }

  var geometryType = {
    LineString: line,
    MultiLineString: polygon,
    Polygon: polygon,
    MultiPolygon: function(arcs) { return arcs.map(polygon); }
  };

  return o.type === "GeometryCollection"
      ? {type: o.type, geometries: o.geometries.map(geometry)}
      : geometry(o);
};

function reverse(array, n) {
  var t, j = array.length, i = j - n; while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
}
