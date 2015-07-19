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
      indexes = index(),
      options = topology.options || {ignoreSelfIntersections: true},
      ignoreSelfIntersections = options.ignoreSelfIntersections,
      leftByIndex = new Int32Array(coordinates.length),
      rightByIndex = new Int32Array(coordinates.length),
      junctionByIndex = new Int8Array(coordinates.length),
      junctionCount = 0, // upper bound on number of junctions
      visitedByIndex = ignoreSelfIntersections? new Int32Array(coordinates.length) : null;

  clear(leftByIndex);
  clear(rightByIndex);
  if (ignoreSelfIntersections) clear(visitedByIndex);

  for (var i = 0, n = lines.length; i < n; ++i) {
    var line = lines[i],
        lineStart = line[0],
        lineEnd = line[1],
        previousIndex,
        currentIndex = indexes[lineStart],
        nextIndex = indexes[++lineStart];
    ++junctionCount, junctionByIndex[currentIndex] = 1; // start
    while (++lineStart <= lineEnd) {
      sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[lineStart]);
    }
    ++junctionCount, junctionByIndex[nextIndex] = 1; // end
  }

  if (ignoreSelfIntersections) {
    clear(visitedByIndex);
  }

  for (var i = 0, n = rings.length; i < n; ++i) {
    var ring = rings[i],
        ringStart = ring[0] + 1,
        ringEnd = ring[1],
        previousIndex = indexes[ringEnd - 1],
        currentIndex = indexes[ringStart - 1],
        nextIndex = indexes[ringStart],
        junctionCount0 = junctionCount;

    sequence(i, previousIndex, currentIndex, nextIndex);
    while (++ringStart <= ringEnd) {
      sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[ringStart]);
    }
    if (!ignoreSelfIntersections && junctionCount0 != junctionCount) {
      ring.hasJunction = true;
    }
  }

  if (!ignoreSelfIntersections) {
    // If a ring of the form AA+ does not contain a 'junction', assign it one.
    // A junction anywhere will trigger detection of the shared arc.
    // If self intersections are not ignored, the ring does not contain a junction, and
    // a coordinate appears twice, then it has the same neighbors in each case, 
    // induction, and the ring can be decomposed.
    for (var i = 0, n = rings.length; i < n; ++i) {
      var ring = rings[i];
      if (!ring.hasJunction) {
        var ringStart = ring[0],
            ringEnd = ring[1],
            firstCoordinate = indexes[ringStart];

        for (var j = ringStart + 1; j < ringEnd; ++j) {
          if (indexes[j] == firstCoordinate) { // the rest is replication
            ++junctionCount, junctionByIndex[firstCoordinate] = 1;
            break;
          }
        }
      } else {
        delete ring.hasJunction;
      }
    }
  }
  
  function sequence(i, previousIndex, currentIndex, nextIndex) {
    if (ignoreSelfIntersections) {
      if (visitedByIndex[currentIndex] === i) return; // ignore self-intersection
      visitedByIndex[currentIndex] = i;
    } else if (previousIndex == nextIndex) {
      ++junctionCount, junctionByIndex[currentIndex] = 1; // arc folds back on itself
      return;
    }
    var leftIndex = leftByIndex[currentIndex];
    if (leftIndex >= 0) {
      var rightIndex = rightByIndex[currentIndex];
      if ((leftIndex !== previousIndex || rightIndex !== nextIndex)
        && (leftIndex !== nextIndex || rightIndex !== previousIndex)) {
        ++junctionCount, junctionByIndex[currentIndex] = 1;
      }
    } else {
      leftByIndex[currentIndex] = previousIndex;
      rightByIndex[currentIndex] = nextIndex;
    }
  }

  function index() {
    var indexByPoint = hashmap(coordinates.length * 1.4, hashIndex, equalIndex, Int32Array, -1, Int32Array),
        indexes = new Int32Array(coordinates.length);

    for (var i = 0, n = coordinates.length; i < n; ++i) {
      indexes[i] = indexByPoint.maybeSet(i, i);
    }

    return indexes;
  }

  function hashIndex(i) {
    return hashPoint(coordinates[i]);
  }

  function equalIndex(i, j) {
    return equalPoint(coordinates[i], coordinates[j]);
  }

  function clear(arr) {
    for (var i = 0, n = coordinates.length; i < n; ++i) {
      arr[i] = -1;
    }
  }

  visitedByIndex = leftByIndex = rightByIndex = null;

  var junctionByPoint = hashset(junctionCount * 1.4, hashPoint, equalPoint);

  // Convert back to a standard hashset by point for caller convenience.
  for (var i = 0, n = coordinates.length, j; i < n; ++i) {
    if (junctionByIndex[j = indexes[i]]) {
      junctionByPoint.add(coordinates[j]);
    }
  }

  return junctionByPoint;
};
