var hashtable = require("./hashtable"),
    arcify = require("./arcify");

// Constructs the topology for the specified hash of objects.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.
// The given hash is arcified, and the shared arcs are determined.
// The returned topology is a precursor to a TopoJSON Topology object,
// where each arc is represented as a contiguous slice of a shared buffer.
// Some of the arcs may be duplicated, and some may be split.
module.exports = function(objects) {
  var topology = arcify(objects),
      arcCount = topology.arcs.length,
      coordinates = topology.coordinates,
      coordinateCount = coordinates.length,
      arcByMid = hashtable(1 << Math.ceil(Math.log(coordinateCount - arcCount * 2) / Math.LN2), hashPoint, equalPoint),
      arcsByEnd = hashtable(1 << Math.ceil(Math.log(arcCount * 2) / Math.LN2), hashPoint, equalPoint),
      instancesByArc = hashtable(1 << Math.ceil(Math.log(arcCount) / Math.LN2), hashArc, equalArc);

  topology.arcs.forEach(function unify(arc) {
    var coarcs,
        coarc,
        start = point(arc.start),
        end = point(arc.end);

    if (arc.start > arc.end) throw new Error("invalid input: non-unified arcs must be forward-facing");

    // Is there an arc that goes through the new arc’s start?
    // If there is, we need to cut it before continuing.
    // Call this coincident arc a “coarc” for short.
    if (coarc = arcByMid.get(start)) {

      // If the old arc can be rotated to the new arc’s start,
      // then we don’t need to cut the old arc. But otherwise, we do.
      if (!rotate(coarc, start)) {

        // Find where the arc intersects the start, and cut it there.
        // A self-intersecting arc may require being cut multiple times.
        var costep = coarc.start < coarc.end ? 1 : -1,
            coindex = coarc.start + costep,
            coend = coarc.end;
        while (coindex !== coend) {
          if (equalPoint(point(coindex), start)) {
            split(coarc, coindex);
            coarc = coarc.next;
          }
          ++coindex;
        }
      }
    }

    // Now, are there any old arcs that terminate at the new arc’s start?
    if (coarcs = arcsByEnd.get(start)) {
      var coindex = -1,
          cocount = coarcs.length,
          deviation;

      while (++coindex < cocount) {
        coarc = coarcs[coindex];

        deviation = followForward(arc, coarc);

        // Does the old arc equal or extend the new arc?
        if (deviation === arc.end) {

          // If the old arc extends the new arc, split it.
          if (Math.abs(coarc.end - coarc.start) > arc.end - arc.start) {
            split(coarc, (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1) + coarc.start);
          }

          // Use the old arc (or the chunk of the old arc we just split).
          arc.start = coarc.start;
          arc.end = coarc.end;
          instancesByArc.get(arc).push(arc);
          return;
        }

        // Or do the old and new arc share a starting sequence?
        if (deviation > arc.start) {

          // If the old arc extends beyond the shared sequence, split it.
          if (Math.abs(coarc.end - coarc.start) > deviation - arc.start) {
            split(coarc, (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1) + coarc.start);
          }

          // Use the shared sequence for the first part of the arc,
          // and then create a new arc to unify for the remainder.
          // TODO Consider using a queue rather than recursion.
          arc.next = {start: deviation, end: arc.end, next: arc.next};
          arc.start = coarc.start;
          arc.end = coarc.end;
          instancesByArc.get(arc).push(arc);
          return void unify(arc.next);
        }

        deviation = followBackward(arc, coarc);

        // Does the reversed old arc equal or extend the new arc?
        if (deviation === arc.end) {

          // If the reversed old arc extends the new arc, split it.
          if (Math.abs(coarc.end - coarc.start) > arc.end - arc.start) {
            split(coarc, coarc.end - (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1));
            coarc = coarc.next;
          }

          // Use the old arc (or the chunk of the old arc we just split).
          arc.start = coarc.end;
          arc.end = coarc.start;
          instancesByArc.get(arc).push(arc);
          return;
        }

        // Or do the reversed old arc and the new arc share a starting sequence?
        if (deviation > arc.start) {

          // If the reversed old arc extends beyond the shared sequence, split it.
          if (Math.abs(coarc.end - coarc.start) > deviation - arc.start) {
            split(coarc, coarc.end - (deviation - arc.start) * (coarc.start < coarc.end ? 1 : -1));
            coarc = coarc.next;
          }

          // Use the shared sequence for the first part of the arc,
          // and then create a new arc to unify for the remainder.
          // TODO Consider using a queue rather than recursion.
          arc.next = {start: deviation, end: arc.end, next: arc.next};
          arc.start = coarc.end;
          arc.end = coarc.start;
          instancesByArc.get(arc).push(arc);
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
      // But, ignore it if it’s just this arc self-intersecting.
      if ((coarc = arcByMid.get(arcPoint)) && coarc !== arc) {

        // If the old arc can be rotated to the new arc’s point,
        // then we don’t need to cut the old arc. But otherwise, we do.
        if (!rotate(coarc, arcPoint)) {

          // Find where the arc intersects the point, and cut it there.
          // A self-intersecting arc may require being cut multiple times.
          var costep = coarc.start < coarc.end ? 1 : -1,
              coindex = coarc.start + costep,
              coend = coarc.end;
          while (coindex !== coend) {
            if (equalPoint(point(coindex), arcPoint)) {
              split(coarc, coindex);
              coarc = coarc.next;
            }
            ++coindex;
          }
        }

        // Cut the new arc at the intersection point,
        // and then create a new arc to unify for the remainder.
        // TODO Consider using a queue rather than recursion.
        arc.next = {start: arcIndex, end: arc.end, next: arc.next};
        arc.end = arcIndex;
        instancesByArc.set(arc, [arc]);
        return void unify(arc.next);
      }

      arcByMid.set(arcPoint, arc);
      ++arcIndex;
    }

    // By the time we get to the end,
    // we would have already detected coincident arcs!
    // So we merely have to register the endpoint.
    // For closed arcs, arcsByEnd will already have this arc.
    if (coarcs = arcsByEnd.get(end)) {
      if (!equalPoint(start, end)) coarcs.push(arc);
    } else {
      arcsByEnd.set(end, [arc]);
    }

    instancesByArc.set(arc, [arc]);
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

  // Splits the specified arc at the specified index.
  function split(arc, index) {
    var instances = instancesByArc.get(arc),
        arcs = [],
        nexts = [];

    if (index <= arc.start || index >= arc.end) throw new Error("can only split at midpoint");

    // The old arc (pre-split, complete) arc is going away, so remove it.
    instancesByArc.remove(arc);

    // Split all instances of the arc at the specified index.
    instances.forEach(function(arc) {
      var next = arc.next = {start: index, end: arc.end, next: arc.next};
      arc.end = index;
      arcs.push(arc);
      nexts.push(next);
    });

    // Record new instances of the two new arcs.
    var next = arc.next;
    instancesByArc.set(arc, arcs);
    instancesByArc.set(next, nexts);

    // Replace the old arc with the new arc at the old end point.
    arcs = arcsByEnd.get(point(next.end));
    for (var i = 0, n = arcs.length; i < n; ++i) {
      if (arcs[i] === arc) {
        arcs[i] = next;
        break;
      }
    }

    var indexPoint = point(index);

    // Remove the old occurrence of the arc going through the index point.
    arcByMid.remove(indexPoint);

    // Record the new arcs at the new termination point.
    // If this arc is self-intersecting,
    // then earlier parts may already be be registered at this index point.
    arcs = arcsByEnd.get(indexPoint);
    if (arcs) arcs.push(arc, next);
    else arcsByEnd.set(indexPoint, [arc, next]);

    // When an old arc is split,
    // we must create a new arc for the chunk after the split,
    // and then update the arcByMid records to point to the new chunk.
    var i = next.start, j = next.end;
    if (i < j) { while (++i < j) arcByMid.set(point(i), next); }
    else { while (++j < i) arcByMid.set(point(j), next); }
  }

  // If possible, rotate the specified arc to start at the specified point.
  // Returns true only if the specified arc was able to be rotated;
  // otherwise returns false if the arc was fixed or not closed.
  // Assumes that the specified arc contains the specified point!
  function rotate(arc, start1) {
    var start0 = point(arc.start);
    if (equalPoint(start0, point(arc.end)) && arcsByEnd.get(start0).length < 2) {

      // Find the first instance of the new start point.
      var i = arc.start, j = arc.end, k = 0;
      if (i < j) { do ++k; while (++i < j && !equalPoint(point(i), start1)); }
      else { do --k; while (++j < i && !equalPoint(point(j), start1)); }

      // Rotate the arc by k; this only affects the coordinate buffer.
      // Since the arc is closed,
      // and it’s the only arc terminating at its start & end,
      // these coordinates are exclusive to this arc
      // and it’s safe to rotate the coordinates in-place.
      if (k > 0) rotateBuffer(coordinates.slice(i = arc.start << 1, j = arc.end << 1), (arc.end - arc.start - k) << 1);
      else rotateBuffer(coordinates.slice(i = arc.end << 1, j = arc.start << 1), (arc.start - arc.end + k) << 1);

      // Rotating ignores the old closing coordinate,
      // so we must restore it after rotating.
      coordinates[j] = coordinates[i];
      coordinates[j + 1] = coordinates[i + 1];

      arcByMid.set(start0, arc);
      arcsByEnd.remove(start0);
      arcByMid.remove(start1);
      arcsByEnd.set(start1, [arc]);
      return true;
    }
    return false;
  }

  // TODO Test whether arrays or buffer slices perform more efficiently.
  function point(i) {
    return [coordinates[i <<= 1], coordinates[i + 1]];
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

function rotateBuffer(buffer, offset) {
  Array.prototype.reverse.call(buffer);
  Array.prototype.reverse.call(buffer.slice(0, offset));
  Array.prototype.reverse.call(buffer.slice(offset, buffer.length));
}
