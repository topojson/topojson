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

    if (coarcs = arcsByEnd.get(start)) {
      var coarcIndex = -1,
          coarcCount = coarcs.length,
          coarc;

      while (++coarcIndex < coarcCount) {
        coarc = coarcs[coarcIndex];

        if (followForward(arc, coarc) === arc.end) { // coarc subsumes arc
          if (coarc.end - coarc.start !== arc.end - arc.start) throw new Error("coarc keeps going");
          arc.start = coarc.start, arc.end = coarc.end;
          return; // uh, really?
        }

        if (followBackward(arc, coarc) === arc.end) { // reverse(coarc) subsumes arc
          if (coarc.end - coarc.start !== arc.end - arc.start) throw new Error("coarc keeps going");
          var step = coarc.start < coarc.end ? 1 : -1;
          arc.start = coarc.end - step, arc.end = coarc.start - step;
          return; // uh, really?
        }
      }
      coarcs.push(arc);
    } else {
      arcsByEnd.set(start, [arc]);
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

  // Returns the coordinate index in A where A deviates from B.
  // For example, if A = [p1, p2, p3] and B = [p1, p2, p4],
  // then A follows B for two points before deviating,
  // and so this function returns A.start + 2.
  function followForward(a, b) {
    var ia = a.start, ja = a.end, da = ia < ja ? 1 : -1,
        ib = b.start, jb = b.end, db = ib < jb ? 1 : -1;
    while (equalPoint(point(ia), point(ib)) && ia != ja && ib != jb) ia += da, ib += db;
    return ia;
  }

  // Returns the coordinate index in A where A deviates from reverse(B).
  // For example, if A = [p1, p2, p3] and B = [p4, p2, p1],
  // then A follows B for two points before deviating,
  // and so this function returns A.start + 2.
  function followBackward(a, b) {
    var ia = a.start, ja = a.end, da = ia < ja ? 1 : -1,
        ib = b.end, jb = b.start, db = ib < jb ? 1 : -1;
    ib += db, jb += db; // start is inclusive, end is exclusive
    while (equalPoint(point(ia), point(ib)) && ia != ja && ib != jb) ia += da, ib += db;
    return ia;
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
