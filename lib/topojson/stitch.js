var type = require("./type");

module.exports = function(topology, options) {
  var arcs = topology.arcs,
      cuts = [];
  arcs.forEach(function(arc, i) {
    for (var j = 0, n = arc.length; j < n; ++j) {
      if (arc[j][0] !== -180) return;
    }
    cuts.push(i);
  });

  // If a ring shares an arc with itself, then we can remove this arc.  Then,
  // attempt to reconnect fragments.  If only one fragment remains, then the
  // ring is already closed and nothing more needs to be done.

  // If a ring has only one arc remaining after removing one antimeridian arc,
  // then nothing needs to be done; it is already closed.

  // If a MultiPolygon has unclosed polygons after removing the same
  // antimeridian arc from all polygons, then attempt to merge polygons.

  // If a ring has multiple arcs remaining after removing one antimeridian arc.
  console.log(cuts);
  return;
  var verbose = false;

  if (options)
    "verbose" in options && (verbose = !!options["verbose"]);

  var stitch = type({
    polygon: function(polygon) {
      for (var j = 0, m = polygon.length; j < m; ++j) {
        var line = polygon[j],
            i = -1,
            n = line.length,
            a = false,
            b = false,
            c = false,
            i0 = -1;
        for (i = 0; i < n; ++i) {
          var point = line[i],
              antimeridian = Math.abs(Math.abs(point[0]) - 180) < 1e-2,
              polar = Math.abs(Math.abs(point[1]) - 90) < 1e-2;
          if (antimeridian || polar) {
            if (!(a || b || c)) i0 = i;
            if (antimeridian) {
              if (a) c = true;
              else a = true;
            }
            if (polar) b = true;
          }
          if (!antimeridian && !polar || i === n - 1) {
            if (a && b && c) {
              if (verbose) console.warn("stitch: removed polar cut [" + line[i0] + "] … [" + line[i] + "]");
              line.splice(i0, i - i0);
              n -= i - i0;
              i = i0;
            }
            a = b = c = false;
          }
        }
      }
    }
  });

  for (var key in objects) {
    stitch.object(objects[key]);
  }
};
