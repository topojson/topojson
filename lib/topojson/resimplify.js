module.exports = function(topology, options) {
  var minimumArea = 0,
      retainProportion,
      verbose = false,
      N = 0,
      M = 0,
      arcs = topology.arcs,
      n = arcs.length;

  if (options)
    "verbose" in options && (verbose = !!options["verbose"]),
    "minimum-area" in options && (minimumArea = +options["minimum-area"]),
    "retain-proportion" in options && (retainProportion = +options["retain-proportion"]);

  for (var i = 0; i < n; ++i) N += arcs[i].length;

  // Compute the effective minimum area if retaining by proportion.
  if (retainProportion) {
    for (var i = 0, areas = []; i < n; ++i) {
      for (var arc = arcs[i], j = 0, m = arc.length; j < m; ++j) {
        areas.push(arc[j].area);
      }
    }
    minimumArea = areas.sort(function(a, b) { return b - a; })[Math.ceil((N - 1) * retainProportion)];
    if (verbose) console.warn("simplification: effective minimum area " + minimumArea.toPrecision(3));
  }

  topology = Object.create(topology);

  // Derive the filtered arcs array and copy it into the new topology.
  for (var i = 0, filteredArcs = topology.arcs = [], delta = [0, 0]; i < n; ++i) {
    for (var arc = arcs[i], filteredArc = [], j = 0, m = arc.length; j < m; ++j) {
      var point = arc[j];
      if (point.area >= minimumArea) filteredArc.push([point[0] + delta[0], point[1] + delta[1]]), ++M, delta[0] = delta[1] = 0;
      else delta[0] += point[0], delta[1] += point[1];
    }
    filteredArcs.push(filteredArc);
  }

  if (verbose) console.warn("simplification: retained " + M + " / " + N + " points (" + Math.round((M / N) * 100) + "%)");

  return topology;
};
