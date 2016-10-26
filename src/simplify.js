import presimplify from "./presimplify";

export default function(topology, options) {
  var minimumArea = 0;

  if (options)
    "minimum-area" in options && (minimumArea = +options["minimum-area"]);

  return simplify(presimplify(topology, options), minimumArea);
}

export function simplify(topology, minimumArea) {

  // Remove points whose area is less than the minimum area.
  topology.arcs.forEach(topology.transform ? function(arc) {
    var dx = 0,
        dy = 0, // accumulate removed points
        i = -1,
        j = -1,
        n = arc.length,
        source,
        target;

    while (++i < n) {
      source = arc[i];
      if (source[2] >= minimumArea) {
        target = arc[++j];
        target[0] = source[0] + dx;
        target[1] = source[1] + dy;
        dx = dy = 0;
      } else {
        dx += source[0];
        dy += source[1];
      }
    }

    arc.length = ++j;
  } : function(arc) {
    var i = -1,
        j = -1,
        n = arc.length,
        point;

    while (++i < n) {
      point = arc[i];
      if (point[2] >= minimumArea) {
        arc[++j] = point;
      }
    }

    arc.length = ++j;
  });

  // Remove the computed area for each point, and remove coincident points.
  // This is done as a separate pass because some coordinates may be shared
  // between arcs (such as the last point and first point of a cut line).
  // If the entire arc is empty, retain at least two points (per spec).
  topology.arcs.forEach(topology.transform ? function(arc) {
    var i = 0,
        j = 0,
        n = arc.length,
        p = arc[0];
    p.length = 2;
    while (++i < n) {
      p = arc[i];
      p.length = 2;
      if (p[0] || p[1]) arc[++j] = p;
    }
    arc.length = (j || 1) + 1;
  } : function(arc) {
    var i = 0,
        j = 0,
        n = arc.length,
        p = arc[0],
        x0 = p[0],
        y0 = p[1],
        x1,
        y1;
    p.length = 2;
    while (++i < n) {
      p = arc[i], x1 = p[0], y1 = p[1];
      p.length = 2;
      if (x0 !== x1 || y0 !== y1) arc[++j] = p, x0 = x1, y0 = y1;
    }
    arc.length = (j || 1) + 1;
  });

  return topology;
}
