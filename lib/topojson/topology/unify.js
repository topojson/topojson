var hashtable = require("./hashtable");

module.exports = function(topology) {
  var arcCount = topology.arcs.length,
      coordinateCount = topology.coordinates.length,
      arcByMid = hashtable(1 << Math.ceil(Math.log(coordinateCount - arcCount * 2) / Math.LN2), hashPoint, equalPoint),
      arcsByEnd = hashtable(1 << Math.ceil(Math.log(arcCount * 2) / Math.LN2), hashPoint, equalPoint);

  topology.arcs.forEach(function(arc) {
    var coarcs,
        start = point(arc.start),
        end = point(arc.end);

    if (arc.start > arc.end) throw new Error("invalid input: non-unified arcs must be forward-facing");
    if (equalPoint(start, end)) throw new Error("not yet implemented: new arc is closed");

    // Are there any previous arcs that terminate at the new arc’s start?
    if (coarcs = arcsByEnd.get(start)) {
      var coarcIndex = -1,
          coarcCount = coarcs.length,
          coarc,
          deviation;

      while (++coarcIndex < coarcCount) {
        coarc = coarcs[coarcIndex];

        deviation = followForward(arc, coarc);
        if (deviation === arc.end) { // coarc equals or extends arc
          if (coarc.end - coarc.start !== arc.end - arc.start) { // extends, so split coarc
            var split = (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1) + coarc.start;
            coarc.next = {start: split, end: coarc.end, next: coarc.next};
            coarc.end = split;

            // TODO remove arc at mid
            // TODO record new arcs at split
          }
          arc.start = coarc.start, arc.end = coarc.end;
          return; // uh, really?
        } else if (deviation > arc.start) { // partial overlap
          throw new Error("not yet implemented: new arc deviates before coarc ends");
        }

        deviation = followBackward(arc, coarc);
        if (deviation === arc.end) { // reverse(coarc) equals or extends arc
          if (coarc.end - coarc.start !== arc.end - arc.start) { // extends, so split coarc
            var split = (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1) + coarc.start;
            coarc.next = {start: split, end: coarc.end, next: coarc.next};
            coarc.end = split;
            coarc = coarc.next;

            // TODO remove arc at mid
            // TODO record new arcs at split
          }
          arc.start = coarc.end, arc.end = coarc.start;
          return; // uh, really?
        } else if (deviation > arc.start) { // partial overlap
          throw new Error("not yet implemented: new arc deviates before reverse(coarc) ends");
        }
      }
      coarcs.push(arc);
    }

    // Or is there an arc that goes through the new arc’s start?
    else if (coarc = arcByMid.get(start)) {

      // Find where the arc intersects the start, and cut it there.
      // A self-intersecting arc may require being cut multiple times.
      var coarcIndex = coarc.start,
          coarcEnd = coarc.end,
          coarcStep = coarcIndex < coarcEnd ? 1 : -1;
      coarcEnd += coarcStep;
      while (coarcIndex !== coarcEnd) {
        if (equalPoint(point(coarcIndex++), start)) {
          throw new Error("not yet implemented: new arc starts inside coarc");
        }
      }
    }

    // Otherwise, this starting point is unique to the new arc.
    else {
      arcsByEnd.set(start, [arc]);
    }

    // Assign all midpoints to this arc.
    var arcIndex = arc.start + 1,
        arcEnd = arc.end,
        arcPoint;
    while (arcIndex !== arcEnd) {
      arcPoint = point(arcIndex++);
      if (arcByMid.get(arcPoint)) throw new Error("not yet implemented: new arc crosses coarc");
      arcByMid.set(arcPoint, arc);
    }

    // Since we only detect exact matches (currently),
    // if there were an exact match,
    // we would have already detected it above.
    if (coarcs = arcsByEnd.get(end)) {
      coarcs.push(arc);
    } else {
      arcsByEnd.set(end, [arc]);
    }
  });

  // Returns the last coordinate index in A that follows B.
  // For example, if A = [p1, p2, p3] and B = [p1, p2, p4],
  // then A follows B for two points before deviating,
  // and so this function returns A.start + 1.
  function followForward(a, b) {
    var ia = a.start, ja = a.end, da = ia < ja ? 1 : -1,
        ib = b.start, jb = b.end, db = ib < jb ? 1 : -1;
    ja += da, jb += db;
    while (equalPoint(point(ia), point(ib)) && ia !== ja && ib !== jb) ia += da, ib += db;
    return ia - da;
  }

  // Returns the last coordinate index in A that follows reverse(B).
  // For example, if A = [p1, p2, p3] and B = [p4, p2, p1],
  // then A follows B for two points before deviating,
  // and so this function returns A.start + 1.
  function followBackward(a, b) {
    var ia = a.start, ja = a.end, da = ia < ja ? 1 : -1,
        ib = b.end, jb = b.start, db = ib < jb ? 1 : -1;
    ja += da, jb += db;
    while (equalPoint(point(ia), point(ib)) && ia !== ja && ib !== jb) ia += da, ib += db;
    return ia - da;
  }

  function point(i) {
    return topology.coordinates.slice(i <<= 1, i + 2);
  }

  return topology;
};

var hashBuffer = new ArrayBuffer(8),
    hashFloats = new Float64Array(hashBuffer),
    hashInts = new Int32Array(hashBuffer);

function hashFloat(x) {
  hashFloats[0] = x;
  x = hashInts[1] ^ hashInts[0];
  x ^= (x >>> 20) ^ (x >>> 12);
  x ^= (x >>> 7) ^ (x >>> 4);
  return x;
}

function hashPoint(point) {
  var h = (hashFloat(point[0]) + 31 * hashFloat(point[1])) | 0;
  return h < 0 ? ~h : h;
}

function equalPoint(pointA, pointB) {
  return pointA[0] === pointB[0]
      && pointA[1] === pointB[1];
}
