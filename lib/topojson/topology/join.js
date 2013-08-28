var hashtable = require("./hashtable"),
    hashPoint = require("./point-hash"),
    equalPoint = require("./point-equal");

// Given a linearized (pre-)topology, identifies all of the junctions. These are
// the points at which arcs (lines or rings) will need to be cut so that each
// arc is represented uniquely.
//
// A junction is a point where at least one arc deviates from another arc going
// through the same point. For example, consider the point B. If there is a arc
// through ABC and another arc through CBA, then B is not a junction because in
// both cases the adjacent point pairs are {A,C}. However, if there is an
// additional arc ABD, then {A,D} != {A,C}, and thus B becomes a junction.
//
// For a closed ring ABCA, the first point A’s adjacent points are the second
// and last point {B,C}. For an open line ABC, the first point A’s adjacent
// points are null and the second point {null,B}.
module.exports = function(topology) {
  var coordinates = topology.coordinates,
      lines = topology.lines,
      rings = topology.rings,
      neighborsByPoint = hashtable(coordinates.length, hashPoint, equalPoint),
      junctionByPoint = hashtable(coordinates.length, hashPoint, equalPoint);

  for (var i = 0, n = lines.length; i < n; ++i) {
    var line = lines[i],
        lineStart = line[0],
        lineEnd = line[1],
        previousPoint = null,
        currentPoint = null,
        nextPoint = coordinates[lineStart];
    while (++lineStart <= lineEnd) {
      sequence(previousPoint = currentPoint, currentPoint = nextPoint, nextPoint = coordinates[lineStart]);
    }
    sequence(previousPoint = currentPoint, currentPoint = nextPoint, null);
  }

  for (var i = 0, n = rings.length; i < n; ++i) {
    var ring = rings[i],
        ringStart = ring[0] + 1,
        ringEnd = ring[1],
        previousPoint = coordinates[ringEnd - 1],
        currentPoint = coordinates[ringStart - 1],
        nextPoint = coordinates[ringStart];
    sequence(previousPoint, currentPoint, nextPoint);
    while (++ringStart <= ringEnd) {
      sequence(previousPoint = currentPoint, currentPoint = nextPoint, nextPoint = coordinates[ringStart]);
    }
  }

  function sequence(previousPoint, currentPoint, nextPoint) {
    var neighbors = neighborsByPoint.get(currentPoint);
    if (neighbors) {
      if ((!equalNeighbor(neighbors[0], previousPoint)
        || !equalNeighbor(neighbors[1], nextPoint))
        && (!equalNeighbor(neighbors[0], nextPoint)
        || !equalNeighbor(neighbors[1], previousPoint))) {
        junctionByPoint.set(currentPoint, true);
      }
    } else {
      neighborsByPoint.set(currentPoint, [previousPoint, nextPoint]);
    }
  }

  return junctionByPoint;
};

function equalNeighbor(pointA, pointB) {
  return pointA && pointB
      ? pointA[0] === pointB[0] && pointA[1] === pointB[1]
      : !pointA === !pointB;
}
