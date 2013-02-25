var type = require("./type"),
    area = require("./area"),
    topojson = require("../../");

module.exports = function(topology, options) {
  var minimumArea = 0,
      cw = true; // force exterior rings to be clockwise?

  if (arguments.length > 1)
    "minimum-area" in options && (minimumArea = +options["minimum-area"]),
    "force-clockwise" in options && (cw = !!options["force-clockwise"]);

  var filter = type({
    Polygon: function(polygon) {
      var arcs = polygon.arcs,
          a = ringArea(arcs[0]);
      if (a < 0) {
        if (cw) {
          reverse(arcs[0]);
          a = -a;
        } else {
          a += 4 * Math.PI;
        }
      }
      if (a <= minimumArea) {
        polygon.type = null;
        delete polygon.arcs;
      } else if (cw) {
        filterHoles(arcs);
      }
    },
    MultiPolygon: function(multiPolygon) {
      multiPolygon.arcs = multiPolygon.arcs.filter(function(polygon) {
        var a = ringArea(polygon[0]);
        if (a < 0) {
          if (cw) {
            reverse(polygon[0]);
            a = -a;
          } else {
            a += 4 * Math.PI;
          }
        }
        if (a > minimumArea) {
          if (cw) filterHoles(polygon);
          return true;
        }
      });
    }
  });

  for (var key in topology.objects) {
    filter.object(topology.objects[key]);
  }

  function filterHoles(rings) {
    for (var i = 1, n = rings.length, r; i < n; ++i) {
      if (ringArea(r = rings[i]) > 0) reverse(r);
    }
  }

  function ringArea(ring) {
    return area(topojson.object(topology, {type: "Polygon", arcs: [ring]}).coordinates[0]);
  }
};

// TODO It might be slightly more compact to reverse the arc.
function reverse(ring) {
  var i = -1, n = ring.length;
  ring.reverse();
  while (++i < n) ring[i] = ~ring[i];
}
