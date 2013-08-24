    // occurrences: arcsByPoint,
      // arcsByPoint = hashtable(1 << Math.ceil(Math.log(count) / Math.LN2), hashPoint, equalPoint),

  // function recordOccurrence(arc, index) {
  //   var i = index << 1,
  //       point = arcifiedPoints.slice(i, i + 2),
  //       arcs = arcsByPoint.get(point);
  //   if (!arcs) arcsByPoint.set(point, [arc]);
  //   else if (arcs.indexOf(arc) < 0) arcs.push(arc); // TODO remove indexOf?
  // }

// var hashBuffer = new ArrayBuffer(8),
//     hashFloats = new Float64Array(hashBuffer),
//     hashInts = new Int32Array(hashBuffer);

// function hashFloat(x) {
//   hashFloats[0] = x;
//   x = hashInts[1] ^ hashInts[0];
//   x ^= (x >>> 20) ^ (x >>> 12);
//   x ^= (x >>> 7) ^ (x >>> 4);
//   return x;
// }

// function hashPoint(point) {
//   var h = (hashFloat(point[0]) + 31 * hashFloat(point[1])) | 0;
//   return h < 0 ? ~h : h;
// }

// function equalPoint(pointA, pointB) {
//   return pointA[0] === pointB[0]
//       && pointA[1] === pointB[1];
// }
