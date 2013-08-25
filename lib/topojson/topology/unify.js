var hashtable = require("./hashtable");

module.exports = function(topology) {
  var arcCount = topology.arcs.length,
      coordinateCount = topology.coordinates.length,
      arcByMid = hashtable(1 << Math.ceil(Math.log(coordinateCount - arcCount * 2) / Math.LN2), hashPoint, equalPoint),
      arcsByEnd = hashtable(1 << Math.ceil(Math.log(arcCount * 2) / Math.LN2), hashPoint, equalPoint);

  topology.arcs.forEach(function unify(arc) {
    var coarcs,
        start = point(arc.start),
        end = point(arc.end);

    if (arc.start > arc.end) throw new Error("invalid input: non-unified arcs must be forward-facing");
    if (equalPoint(start, end)) throw new Error("not yet implemented: new arc is closed");

    // Are there any old arcs that terminate at the new arc’s start?
    if (coarcs = arcsByEnd.get(start)) {
      var coarcIndex = -1,
          coarcCount = coarcs.length,
          coarc,
          deviation;

      while (++coarcIndex < coarcCount) {
        coarc = coarcs[coarcIndex];

        deviation = followForward(arc, coarc);
        if (deviation === arc.end) { // old arc equals or extends new arc
          if (Math.abs(coarc.end - coarc.start) > arc.end - arc.start) { // old arc extends, so split old arc
            deviation = (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1) + coarc.start;
            coarc.next = {start: deviation, end: coarc.end, next: coarc.next};
            coarc.end = deviation;

            var deviationPoint = point(deviation);
            // if (arcByMid.get(deviationPoint) !== coarc) throw new Error("expected coarc to own midpoint");
            // if (arcsByEnd.get(deviationPoint) != null) throw new Error("split point shouldn’t have terminating arcs");
            arcByMid.remove(deviationPoint);
            arcsByEnd.set(deviationPoint, [arc, coarc.next, coarc]);
          }
          arc.start = coarc.start;
          arc.end = coarc.end;
          return; // exact match, so we’re done!
        } else if (deviation > arc.start) { // old and new arcs share something
          if (Math.abs(coarc.end - coarc.start) === deviation - arc.start) { // new arc extends, so split new arc
            arc.next = {start: deviation, end: arc.end, next: arc.next};
            arc.start = coarc.start;
            arc.end = coarc.end;
          } else { // new deviates, split both
            throw new Error("not yet implemented: new arc deviates before old arc");
          }
          return void unify(arc.next); // unify remaining chunk of arc TODO queue instead of recurse?
        }

        deviation = followBackward(arc, coarc);
        if (deviation === arc.end) { // reversed old arc equals or extends new arc
          if (coarc.end - coarc.start !== arc.end - arc.start) { // old arc extends, so split old arc
            deviation = (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1) + coarc.start;
            coarc.next = {start: deviation, end: coarc.end, next: coarc.next};
            coarc.end = deviation;

            var deviationPoint = point(deviation);
            // if (arcByMid.get(deviationPoint) !== coarc) throw new Error("expected coarc to own midpoint");
            // if (arcsByEnd.get(deviationPoint) != null) throw new Error("split point shouldn’t have terminating arcs");
            arcByMid.remove(deviationPoint);
            arcsByEnd.set(deviationPoint, [arc, coarc.next, coarc]);
            coarc = coarc.next;
          }
          arc.start = coarc.end;
          arc.end = coarc.start;
          return; // exact match, so we’re done!
        } else if (deviation > arc.start) { // reversed old and new arcs share something
          if (Math.abs(coarc.end - coarc.start) === deviation - arc.start) { // new extends, so split it
            arc.next = {start: deviation, end: arc.end, next: arc.next};
            arc.start = coarc.end;
            arc.end = coarc.start;
          } else { // new deviates, split both
            throw new Error("not yet implemented: new arc deviates from reversed old arc");
          }
          return void unify(arc.next); // unify remaining chunk of arc TODO queue instead of recurse?
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
