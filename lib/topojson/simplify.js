var topojson = require("../../"),
    systems = require("./coordinate-systems");

module.exports = function(topology, options) {
  var minimumArea = 0,
      retainProportion,
      verbose = false,
      system = null,
      N = 0,
      M = 0;

  if (options)
    "minimum-area" in options && (minimumArea = +options["minimum-area"]),
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]),
    "retain-proportion" in options && (retainProportion = +options["retain-proportion"]),
    "verbose" in options && (verbose = !!options["verbose"]);

  topojson.presimplify(topology, system.triangleArea);

  if (retainProportion) {
    var areas = [];
    topology.arcs.forEach(function(arc) {
      arc.forEach(function(point) {
        areas.push(point[2]);
      });
    });
    minimumArea = areas.sort(function(a, b) { return b - a; })[Math.ceil((N - 1) * retainProportion)];
    if (verbose) console.warn("simplification: effective minimum area " + minimumArea.toPrecision(3));
  }

  topology.arcs = topology.arcs.map(function(arc) {
    var dx = 0, dy = 0; // accumulate removed points
    return arc.filter(function(point) {
      ++N;
      if (point[2] >= minimumArea) {
        point.pop(); // don’t output computed area
        point[0] += dx;
        point[1] += dy;
        dx = dy = 0;
        ++M;
        return true;
      } else {
        dx += point[0];
        dy += point[1];
      }
    });
  });

  if (verbose) console.warn("simplification: retained " + M + " / " + N + " points (" + Math.round((M / N) * 100) + "%)");

  return topology;
};
