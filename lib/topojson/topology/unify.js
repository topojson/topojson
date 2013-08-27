var hashtable = require("./hashtable"),
    arcify = require("./arcify");

// Constructs the topology for the specified hash of objects.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.
// The given hash is arcified, and the shared arcs are determined.
// The returned topology is a precursor to a TopoJSON Topology object,
// where each arc is represented as a contiguous slice of a shared buffer.
// Some of the arcs may be duplicated, and some may be split.
module.exports = function(objects, transform) {
  var topology = arcify(objects, transform),
      arcCount = topology.arcs.length,
      coordinates = topology.coordinates,
      coordinateCount = coordinates.length,
      arcByMid = hashtable(1 << Math.ceil(Math.log(coordinateCount - arcCount * 2) / Math.LN2), hashPoint, equalPoint),
      arcsByEnd = hashtable(1 << Math.ceil(Math.log(arcCount * 2) / Math.LN2), hashPoint, equalPoint),
      instancesByArc = hashtable(1 << Math.ceil(Math.log(arcCount) / Math.LN2), hashArc, equalArc),
      arcQueue = topology.arcs.reverse(),
      arc;

  unify: while (arc = arcQueue.pop()) {
    var coarcs,
        coarc,
        start = arc.start,
        startPoint = coordinates[start],
        end = arc.end,
        endPoint = coordinates[end];

    // Is there an arc that goes through the new arc’s start?
    // If there is, we need to cut it before continuing.
    // Call this coincident arc a “coarc” for short.
    if (coarc = arcByMid.get(startPoint)) {

      // If the old arc is closed and can be rotated to the new arc’s start,
      // then we don’t need to cut the old arc. But otherwise, we do.
      if (!rotate(coarc, startPoint)) {

        // Find where the arc intersects the start, and cut it there.
        // A self-intersecting arc may require being cut multiple times.
        var comid = coarc.start,
            coend = coarc.end;
        while (++comid < coend) {
          if (equalPoint(coordinates[comid], startPoint)) {
            split(coarc, comid);
            coarc = coarc.next;
          }
        }
      }
    }

    // Now, are there any old arcs that terminate at the new arc’s start?
    // This could include the old arc we just split or rotated above.
    if (coarcs = arcsByEnd.get(startPoint)) {
      var coindex = -1,
          cocount = coarcs.length,
          deviation;

      while (++coindex < cocount) {
        coarc = coarcs[coindex];

        deviation = followForward(arc, coarc);

        // Does the old arc equal or extend the new arc?
        if (deviation === end) {

          // If the old arc extends the new arc,
          // we must split it to terminate at the new arc’s end point.
          // Because the new arc is subsumed by the old arc,
          // there’s no advantage to rotating to the end point.
          if (coarc.end - coarc.start > end - start) {
            split(coarc, deviation - start + coarc.start);
          }

          // Use the old arc (or the chunk of the old arc we just split).
          arc.start = coarc.start;
          arc.end = coarc.end;
          instancesByArc.get(coarc).push(arc);
          continue unify;
        }

        // Or do the old and new arc share a starting sequence?
        if (deviation > start) {

          // If the old arc extends beyond the shared sequence,
          // we must rotate it or split it to terminate at the deviation point.
          if (coarc.end - coarc.start > deviation - start) {

            // If we can rotate the new arc to start at the deviation point,
            // then we might be able to avoid an additional split
            // by also rotating the old arc to start at the same point.
            // If not, well, we’ll just split the old arc next time.
            var deviationPoint = coordinates[deviation];
            if (rotate(arc, deviationPoint)) {
              rotate(coarc, deviationPoint);
              arcQueue.push(arc);
              continue unify;
            }

            // Otherwise, split.
            split(coarc, deviation - start + coarc.start);
          }

          // Use the shared sequence for the first part of the arc,
          // and then create a new arc to unify for the remainder.
          arc.next = {start: deviation, end: end, next: arc.next};
          arc.start = coarc.start;
          arc.end = coarc.end;
          instancesByArc.get(coarc).push(arc);
          arcQueue.push(arc.next);
          continue unify;
        }

        deviation = followBackward(arc, coarc);

        // Does the reversed old arc equal or extend the new arc?
        if (deviation === end) {

          // If the reversed old arc extends the new arc,
          // we must split it to terminate at the new arc’s end point.
          // Because the new arc is subsumed by the old arc,
          // there’s no advantage to rotating to the end point.
          if (coarc.end - coarc.start > end - start) {
            split(coarc, coarc.end - deviation + start);
            coarc = coarc.next;
          }

          // Use the old arc (or the chunk of the old arc we just split).
          arc.start = coarc.end;
          arc.end = coarc.start;
          instancesByArc.get(coarc).push(arc);
          continue unify;
        }

        // Or do the reversed old arc and the new arc share a starting sequence?
        if (deviation > start) {

          // If the reversed old arc extends beyond the shared sequence, split it.
          if (coarc.end - coarc.start > deviation - start) {

            // If we can rotate the new arc to start at the deviation point,
            // then we might be able to avoid an additional split
            // by also rotating the old arc to start at the same point.
            // If not, well, we’ll just split the old arc next time.
            var deviationPoint = coordinates[deviation];
            if (rotate(arc, deviationPoint)) {
              rotate(coarc, deviationPoint);
              arcQueue.push(arc);
              continue unify;
            }

            // Otherwise, split.
            split(coarc, coarc.end - deviation + start);
            coarc = coarc.next;
          }

          // Use the shared sequence for the first part of the arc,
          // and then create a new arc to unify for the remainder.
          arc.next = {start: deviation, end: end, next: arc.next};
          arc.start = coarc.end;
          arc.end = coarc.start;
          instancesByArc.get(coarc).push(arc);
          arcQueue.push(arc.next);
          continue unify;
        }
      }

      coarcs.push(arc);
    }

    // Otherwise, this starting point is unique to the new arc. Phew!
    else {
      arcsByEnd.set(startPoint, [arc]);
    }

    // Assign all midpoints to this arc.
    var mid = start,
        midPoint;
    while (++mid < end) {
      midPoint = coordinates[mid];

      // Is there an arc that goes through the new arc’s point?
      // If there is, we need to cut it before restarting.
      // But, ignore it if it’s just this arc self-intersecting.
      if ((coarc = arcByMid.get(midPoint)) && coarc !== arc) {

        // If the old arc can be rotated to the new arc’s point,
        // then we don’t need to cut the old arc. But otherwise, we do.
        if (!rotate(coarc, midPoint)) {

          // Find where the arc intersects the point, and cut it there.
          // A self-intersecting arc may require being cut multiple times.
          var comid = coarc.start,
              coend = coarc.end;
          while (++comid < coend) {
            if (equalPoint(coordinates[comid], midPoint)) {
              split(coarc, comid);
              coarc = coarc.next;
            }
          }
        }

        // Cut the new arc at the intersection point,
        // and then create a new arc to unify for the remainder.
        arc.next = {start: mid, end: end, next: arc.next};
        arc.end = mid;
        instancesByArc.set(arc, [arc]);
        arcsByEnd.get(midPoint).push(arc);
        arcQueue.push(arc.next);
        continue unify;
      }

      // Is there an arc that starts or ends at the new arc’s point?
      // If there is, we need to cut this arc before restarting.
      // Ignore self-intersection with our own start point.
      // We don’t need to check against the end,
      // because our end has not been registered in arcsByEnd yet.
      if (!equalPoint(startPoint, midPoint) && (coarcs = arcsByEnd.get(midPoint))) {

        // Cut the new arc at the intersection point,
        // and then create a new arc to unify for the remainder.
        arc.next = {start: mid, end: end, next: arc.next};
        arc.end = mid;
        instancesByArc.set(arc, [arc]);
        coarcs.push(arc);
        arcQueue.push(arc.next);
        continue unify;
      }

      arcByMid.set(midPoint, arc);
    }

    // By the time we get to the end,
    // we would have already detected coincident arcs!
    // So we merely have to register the endpoint.
    // For closed arcs, arcsByEnd will already have this arc.
    if (coarcs = arcsByEnd.get(endPoint)) {
      if (!equalPoint(startPoint, endPoint)) coarcs.push(arc);
    } else {
      arcsByEnd.set(endPoint, [arc]);
    }

    instancesByArc.set(arc, [arc]);
  }

  topology.arcs = instancesByArc
      .keys()
      .sort(function(a, b) { return a.start - b.start; });

  // Returns the last coordinate index in A that is shared with B.
  // For example, if A = [p1, p2, p3] and B = [p1, p2, p4],
  // then A follows B for two points before deviating,
  // and so this function returns A.start + 1.
  function followForward(a, b) {
    var ia = a.start, ja = a.end, da = ia < ja ? 1 : -1,
        ib = b.start, jb = b.end, db = ib < jb ? 1 : -1;
    ja += da, jb += db;
    while (ia !== ja && ib !== jb && equalPoint(coordinates[ia], coordinates[ib])) ia += da, ib += db;
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
    while (ia !== ja && ib !== jb && equalPoint(coordinates[ia], coordinates[ib])) ia += da, ib += db;
    return ia - da;
  }

  // Splits the specified arc at the specified index.
  function split(arc, mid) {
    var arcs = instancesByArc.get(arc),
        startPoint = coordinates[arc.start],
        midPoint = coordinates[mid],
        endPoint = coordinates[arc.end],
        closed = equalPoint(startPoint, endPoint),
        ends = arcsByEnd.get(endPoint);

    // Remove the old occurrence of the arc going through the index point.
    arcByMid.remove(midPoint);

    // The old arc (pre-split, complete) arc is going away, so remove it.
    instancesByArc.remove(arc);

    // Split all instances of the arc at the specified index.
    arcs.forEach(function(instance, i) {
      instance.next = {start: mid, end: instance.end, next: instance.next};
      instance.end = mid;
    });

    // Record new instances of the two new arcs.
    var next = arc.next;
    instancesByArc.set(arc, arcs);
    instancesByArc.set(next, arcs.map(function(arc) { return arc.next; }));

    // If the old arc was closed, then add the new arc at the old end point.
    if (closed) {
      ends.push(next);
    }

    // Otherwise, replace the old arc with the new arc at the old end point.
    // Since this is an old arc, instance-equality is sufficient to replace.
    else {
      for (var i = 0, n = ends.length; i < n; ++i) {
        if (ends[i] === arc) {
          ends[i] = next;
          break;
        }
      }
    }

    // Record the new arcs at the new termination point.
    // If this arc is self-intersecting,
    // then earlier parts may already be be registered at this index point.
    arcs = arcsByEnd.get(midPoint);
    if (arcs) arcs.push(arc, next);
    else arcsByEnd.set(midPoint, [arc, next]);

    // When an old arc is split,
    // we must update the arcByMid records to point to the new chunk.
    var i = next.start, j = next.end;
    while (++i < j) arcByMid.set(coordinates[i], next);
  }

  // If possible, rotate the specified arc to start at the specified point.
  // Returns true only if the specified arc was able to be rotated;
  // otherwise returns false if the arc was fixed or not closed.
  // Assumes that the specified arc contains the specified point!
  function rotate(arc, newStartPoint) {
    var oldStartPoint = coordinates[arc.start],
        oldEndPoint = coordinates[arc.end],
        coarcs = arcsByEnd.get(oldStartPoint),
        registered = coarcs && coarcs.some(function(coarc) { return coarc === arc; });
    if (equalPoint(oldStartPoint, oldEndPoint) && (!registered || coarcs.length < 2)) {

      // Find the first instance of the new start point.
      var i = arc.start, j = arc.end, k = 0;
      if (i < j) { do ++k; while (++i < j && !equalPoint(coordinates[i], newStartPoint)); }
      else { do --k; while (++j < i && !equalPoint(coordinates[j], newStartPoint)); }

      // Rotate the arc by k; this only affects the coordinate buffer.
      // Since the arc is closed,
      // and it’s the only arc terminating at its start & end,
      // these coordinates are exclusive to this arc
      // and it’s safe to rotate the coordinates in-place.
      if (k > 0) rotateArray(coordinates, i = arc.start, j = arc.end, arc.end - arc.start - k);
      else rotateArray(coordinates, i = arc.end, j = arc.start, arc.start - arc.end + k);

      // Rotating ignores the old closing coordinate,
      // so we must restore it after rotating.
      coordinates[j] = coordinates[i];

      // If we’re rotating an arc that was already registered,
      // update the appropriate instances.
      if (registered) {
        arcByMid.set(oldStartPoint, arc);
        arcsByEnd.remove(oldStartPoint);
        arcByMid.remove(newStartPoint);
        arcsByEnd.set(newStartPoint, [arc]);
      }

      return true;
    }
    return false;
  }

  return topology;
};

// TODO if quantized, use simpler Int32 hashing

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

function hashArc(arc) {
  var i = arc.start, j = arc.end, t;
  if (j < i) t = i, i = j, j = t;
  return i + 31 * j;
}

function equalArc(arcA, arcB) {
  var ia = arcA.start, ja = arcA.end,
      ib = arcB.start, jb = arcB.end, t;
  if (ja < ia) t = ia, ia = ja, ja = t;
  if (jb < ib) t = ib, ib = jb, jb = t;
  return ia === ib && ja === jb;
}

function rotateArray(buffer, start, end, offset) {
  reverse(buffer, start, end);
  reverse(buffer, start, start + offset);
  reverse(buffer, start + offset, end);
}

function reverse(array, start, end) {
  for (var mid = start + ((end-- - start) >> 1), t; start < mid; ++start, --end) {
    t = array[start], array[start] = array[end], array[end] = t;
  }
}
