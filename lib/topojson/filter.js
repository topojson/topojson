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
      var a = ringArea(polygon.arcs[0]);
      if (a < 0) {
        if (cw) {
          reverse(polygon.arcs[0]); // TODO reverse holes, too?
          a = Math.abs(a);
        } else {
          a = 4 * Math.PI - a;
        }
      }
      if (a <= minimumArea) {
        delete polygon.type;
        delete polygon.arcs;
      }
    },
    MultiPolygon: function(multiPolygon) {
      multiPolygon.arcs = multiPolygon.arcs.filter(function(polygon) {
        var a = ringArea(polygon[0]);
        if (a < 0) {
          if (cw) {
            reverse(polygon[0]); // TODO reverse holes, too?
            a = Math.abs(a);
          } else {
            a = 4 * Math.PI - a;
          }
        }
        return a <= minimumArea;
      });
    }
  });

  for (var key in topology.objects) {
    filter.object(topology.objects[key]);
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
