var type = require("./type"),
    prune = require("./prune"),
    systems = require("./coordinate-systems"),
    topojson = require("../../");

module.exports = function(topology, options) {
  var minimumArea = 0,
      system = null,
      clockwise = true; // force exterior rings to be clockwise?

  if (options)
    "minimum-area" in options && (minimumArea = +options["minimum-area"]),
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]),
    "force-clockwise" in options && (clockwise = !!options["force-clockwise"]);

  var filter = type({
    LineString: noop,
    MultiLineString: noop,
    Point: noop,
    MultiPoint: noop,
    Polygon: function(polygon) {
      var arcs = polygon.arcs,
          a = ringArea(arcs[0]);
      if (a < 0) {
        if (clockwise) {
          reverse(arcs[0]);
          a = -a;
        } else {
          a += 4 * Math.PI;
        }
      }
      if (a <= minimumArea) {
        polygon.type = null;
        delete polygon.arcs;
      } else if (clockwise) {
        filterHoles(arcs);
      }
    },
    MultiPolygon: function(multiPolygon) {
      multiPolygon.arcs = multiPolygon.arcs.filter(function(polygon) {
        var a = ringArea(polygon[0]);
        if (a < 0) {
          if (clockwise) {
            reverse(polygon[0]);
            a = -a;
          } else {
            a += 4 * Math.PI;
          }
        }
        if (a > minimumArea) {
          if (clockwise) filterHoles(polygon);
          return true;
        }
      });
    }
  });

  for (var key in topology.objects) {
    filter.object(topology.objects[key]);
  }

  prune(topology, options);

  function filterHoles(rings) {
    for (var i = 1, n = rings.length, r; i < n; ++i) {
      if (ringArea(r = rings[i]) > 0) reverse(r);
    }
  }

  function ringArea(ring) {
    return system.ringArea(topojson.feature(topology, {type: "Polygon", arcs: [ring]}).geometry.coordinates[0]);
  }
};

// TODO It might be slightly more compact to reverse the arc.
function reverse(ring) {
  var i = -1, n = ring.length;
  ring.reverse();
  while (++i < n) ring[i] = ~ring[i];
}

function noop() {}
