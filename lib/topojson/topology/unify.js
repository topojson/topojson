var hashtable = require("./hashtable");

module.exports = function(topology) {
  var arcCount = topology.arcs.length,
      coordinateCount = topology.coordinates.length,
      arcByMid = hashtable(1 << Math.ceil(Math.log(coordinateCount - arcCount * 2) / Math.LN2), hashPoint, equalPoint),
      arcsByEnd = hashtable(1 << Math.ceil(Math.log(arcCount * 2) / Math.LN2), hashPoint, equalPoint);

  topology.arcs.forEach(function unify(arc) {
    var coarcs,
        coarc,
        start = point(arc.start),
        end = point(arc.end);

    if (arc.start > arc.end) throw new Error("invalid input: non-unified arcs must be forward-facing");
    if (equalPoint(start, end)) throw new Error("not yet implemented: new arc is closed");

    // Is there an arc that goes through the new arc’s start?
    // If there is, we need to cut it before continuing.
    // Call this coincident arc a “coarc” for short.
    if (coarc = arcByMid.get(start)) {
      coarcs = [coarc];

      // Find where the arc intersects the start, and cut it there.
      // A self-intersecting arc may require being cut multiple times.
      var coarcStep = coarc.start < coarc.end ? 1 : -1,
          coarcIndex = coarc.start + coarcStep,
          coarcEnd = coarc.end;
      while (coarcIndex !== coarcEnd) {
        if (equalPoint(point(coarcIndex), start)) {
          reassignMid(coarc.next = {start: coarcIndex, end: coarc.end, next: coarc.next});
          coarc.end = coarcIndex;
          coarcs.push(coarc = coarc.next);
        }
        ++coarcIndex;
      }

      arcsByEnd.set(start, coarcs);
      arcByMid.remove(start);
    }

    // Now, are there any old arcs that terminate at the new arc’s start?
    if (coarcs = arcsByEnd.get(start)) {
      var coarcIndex = -1,
          coarcCount = coarcs.length,
          deviation;

      while (++coarcIndex < coarcCount) {
        coarc = coarcs[coarcIndex];

        deviation = followForward(arc, coarc);

        // Does the old arc equal or extend the new arc?
        if (deviation === arc.end) {

          // If the old arc extends the new arc, split it.
          if (Math.abs(coarc.end - coarc.start) > arc.end - arc.start) {
            var codeviation = (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1) + coarc.start;
            reassignMid(coarc.next = {start: codeviation, end: coarc.end, next: coarc.next});
            coarc.end = codeviation;
            var deviationPoint = point(deviation);
            arcByMid.remove(deviationPoint);
            arcsByEnd.set(deviationPoint, [coarc, coarc.next]);
          }

          // Use the old arc (or the chunk of the old arc we just split).
          arc.start = coarc.start;
          arc.end = coarc.end;
          return;
        }

        // Or do the old and new arc share a starting sequence?
        if (deviation > arc.start) {

          // If the old arc extends beyond the shared sequence, split it.
          if (Math.abs(coarc.end - coarc.start) > deviation - arc.start) {
            var codeviation = (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1) + coarc.start;
            reassignMid(coarc.next = {start: codeviation, end: coarc.end, next: coarc.next});
            coarc.end = codeviation;
            var deviationPoint = point(deviation);
            arcByMid.remove(deviationPoint);
            arcsByEnd.set(deviationPoint, [coarc, coarc.next]);
          }

          // Use the shared sequence for the first part of the arc,
          // and then create a new arc to unify for the remainder.
          // TODO Consider using a queue rather than recursion.
          arc.next = {start: deviation, end: arc.end, next: arc.next};
          arc.start = coarc.start;
          arc.end = coarc.end;
          return void unify(arc.next);
        }

        deviation = followBackward(arc, coarc);

        // Does the reversed old arc equal or extend the new arc?
        if (deviation === arc.end) {

          // If the reversed old arc extends the new arc, split it.
          if (Math.abs(coarc.end - coarc.start) > arc.end - arc.start) {
            var codeviation = coarc.end - (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1);
            reassignMid(coarc.next = {start: codeviation, end: coarc.end, next: coarc.next});
            coarc.end = codeviation;
            var deviationPoint = point(deviation);
            arcByMid.remove(deviationPoint);
            arcsByEnd.set(deviationPoint, [coarc, coarc.next]);
            coarc = coarc.next;
          }

          // Use the old arc (or the chunk of the old arc we just split).
          arc.start = coarc.end;
          arc.end = coarc.start;
          return;
        }

        // Or do the reversed old arc and the new arc share a starting sequence?
        if (deviation > arc.start) {

          // If the reversed old arc extends beyond the shared sequence, split it.
          if (Math.abs(coarc.end - coarc.start) > deviation - arc.start) {
            var codeviation = coarc.end - (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1);
            reassignMid(coarc.next = {start: codeviation, end: coarc.end, next: coarc.next});
            coarc.end = codeviation;
            var deviationPoint = point(deviation);
            arcByMid.remove(deviationPoint);
            arcsByEnd.set(deviationPoint, [coarc, coarc.next]);
            coarc = coarc.next;
          }

          // Use the shared sequence for the first part of the arc,
          // and then create a new arc to unify for the remainder.
          // TODO Consider using a queue rather than recursion.
          arc.next = {start: deviation, end: arc.end, next: arc.next};
          arc.start = coarc.end;
          arc.end = coarc.start;
          return void unify(arc.next);
        }
      }

      coarcs.push(arc);
    }

    // Otherwise, this starting point is unique to the new arc. Phew!
    else {
      arcsByEnd.set(start, [arc]);
    }

    // Assign all midpoints to this arc.
    var arcIndex = arc.start + 1,
        arcEnd = arc.end,
        arcPoint;
    while (arcIndex !== arcEnd) {
      arcPoint = point(arcIndex);

      // Is there an arc that goes through the new arc’s point?
      // If there is, we need to cut it before restarting.
      if (coarc = arcByMid.get(arcPoint)) {
        coarcs = [arc, coarc];

        // Find where the arc intersects the point, and cut it there.
        // A self-intersecting arc may require being cut multiple times.
        var coarcStep = coarc.start < coarc.end ? 1 : -1,
            coarcIndex = coarc.start + coarcStep,
            coarcEnd = coarc.end;
        while (coarcIndex !== coarcEnd) {
          if (equalPoint(point(coarcIndex), arcPoint)) {
            reassignMid(coarc.next = {start: coarcIndex, end: coarc.end, next: coarc.next});
            coarc.end = coarcIndex;
            coarcs.push(coarc = coarc.next);
          }
          ++coarcIndex;
        }

        arcsByEnd.set(arcPoint, coarcs);
        arcByMid.remove(arcPoint);

        // Cut the new arc at the intersection point,
        // and then create a new arc to unify for the remainder.
        // TODO Consider using a queue rather than recursion.
        arc.next = {start: arcIndex, end: arc.end, next: arc.next};
        arc.end = arcIndex;
        return void unify(arc.next);
      }

      arcByMid.set(arcPoint, arc);
      ++arcIndex;
    }

    // By the time we get to the end,
    // we would have already detected coincident arcs!
    // So we merely have to register the endpoint.
    if (coarcs = arcsByEnd.get(end)) {
      coarcs.push(arc);
    } else {
      arcsByEnd.set(end, [arc]);
    }
  });

  // Returns the last coordinate index in A that is shared with B.
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

  // Returns the last coordinate index in A that is shared with reverse(B).
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

  function reassignMid(arc) {
    var i = arc.start, j = arc.end;
    if (i < j) { while (++i < j) arcByMid.set(point(i), arc); }
    else { while (++j < i) arcByMid.set(point(j), arc); }
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
