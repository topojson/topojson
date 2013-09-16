var hashset = require("./hashset"),
    hashmap = require("./hashmap"),
    hashPoint = require("./point-hash"),
    equalPoint = require("./point-equal");

// Given an extracted (pre-)topology, identifies all of the junctions. These are
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
// and last point {B,C}. For a line, the first and last point are always
// considered junctions, even if the line is closed; this ensures that a closed
// line is never rotated.
module.exports = function(topology) {
  var coordinates = topology.coordinates,
      lines = topology.lines,
      rings = topology.rings,
      visitedByPoint,
      leftByIndex = hashmap(coordinates.length * 1.4, hash, equal, Int32Array, -1, Int32Array, -1),
      rightByIndex = hashmap(coordinates.length * 1.4, hash, equal, Int32Array, -1, Int32Array, -1),
      junctionByIndex = hashset(coordinates.length * 1.4, hash, equal, Int32Array, -1);

  for (var i = 0, n = lines.length; i < n; ++i) {
    var line = lines[i],
        lineStart = line[0],
        lineEnd = line[1],
        previousIndex,
        currentIndex = lineStart,
        nextIndex = ++lineStart;
    visitedByIndex = hashmap((lineEnd - lineStart) * 1.4, hash, equal, Int32Array, -1, Int8Array, 0);
    junctionByIndex.add(currentIndex); // start
    while (++lineStart <= lineEnd) {
      sequence(previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = lineStart);
    }
    junctionByIndex.add(nextIndex); // end
  }

  for (var i = 0, n = rings.length; i < n; ++i) {
    var ring = rings[i],
        ringStart = ring[0] + 1,
        ringEnd = ring[1],
        previousIndex = ringEnd - 1,
        currentIndex = ringStart - 1,
        nextIndex = ringStart;
    visitedByIndex = hashmap((ringEnd - ringStart + 1) * 1.4, hash, equal, Int32Array, -1, Int8Array, 0);
    sequence(previousIndex, currentIndex, nextIndex);
    while (++ringStart <= ringEnd) {
      sequence(previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = ringStart);
    }
  }

  function sequence(previousIndex, currentIndex, nextIndex) {
    if (visitedByIndex.get(currentIndex)) return; // ignore self-intersection
    visitedByIndex.set(currentIndex, 1);
    var leftIndex = leftByIndex.get(currentIndex);
    if (leftIndex >= 0) {
      var rightIndex = rightByIndex.get(currentIndex);
      if (!(equal(leftIndex, previousIndex)
        && equal(rightIndex, nextIndex))
        && !(equal(leftIndex, nextIndex)
        && equal(rightIndex, previousIndex))) {
        junctionByIndex.add(currentIndex);
      }
    } else {
      leftByIndex.set(currentIndex, previousIndex);
      rightByIndex.set(currentIndex, nextIndex);
    }
  }

  function hash(i) {
    return hashPoint(coordinates[i]);
  }

  function equal(i, j) {
    return equalPoint(coordinates[i], coordinates[j]);
  }

  var junctions = junctionByIndex.values(),
      junctionCount = junctions.length,
      junctionByPoint = hashset(junctionCount * 1.4, hashPoint, equalPoint);
  for (var i = 0; i < junctionCount; ++i) junctionByPoint.add(coordinates[junctions[i]]);
  return junctionByPoint;
};
