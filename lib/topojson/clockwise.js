var type = require("./type");

module.exports = function(topology) {
  var tf = topology.transform,
      kx = tf.scale[0],
      ky = tf.scale[1],
      dx = tf.translate[0],
      dy = tf.translate[1],
      arcs = topology.arcs;

  for (var key in topology.objects) clockwise(topology.objects[key]);

  function clockwise(object) {
    type({
      MultiPolygon: function(multiPolygon) {
        var arcs = multiPolygon.arcs, i = -1, n = arcs.length;
        while (++i < n) this.polygon(arcs[i]);
      },
      Polygon: function(polygon) {
        this.polygon(polygon.arcs);
      },
      line: function(arcs) {
        if (area(line(arcs)) < 0) {
          arcs.reverse();
          for (var i = 0, n = arcs.length; i < n; ++i) arcs[i] = ~arcs[i];
        }
      }
    }).object(object);
  }

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
};

function area(coordinates) {
  var i = 0,
      n = coordinates.length,
      a = coordinates[n - 1][0] * coordinates[0][1],
      b = coordinates[n - 1][1] * coordinates[0][0];
  while (++i < n) {
    a += coordinates[i - 1][0] * coordinates[i][1];
    b += coordinates[i - 1][1] * coordinates[i][0];
  }
  return (b - a) * .5;
}

function reverse(array, n) {
  var t, j = array.length, i = j - n; while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
}
