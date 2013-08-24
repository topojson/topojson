module.exports = function() {
  var hash = hashPoint(1 << 16),
      nodesByStart = hashtable(1 << 16, hash),
      nodeQueue = [];

  function line(points) {
    var i = 1,
        n = points.length,
        p0 = points[0],
        p1 = points[1],
        start = segment(p0, p1),
        arc = start;
    while (++i < n) p0 = p1, p1 = points[i], arc = arc.next = segment(p0, p1);
    return start;
  }

  function segment(p0, p1) {
    var nodes,
        node;

    if (nodes = nodesByStart.get(p0)) {
      var i = -1,
          n = nodes.length;
      while (++i < n) {
        node = nodes[i];
        if (equal(node.next.point, p1)) {
          return {start: node, reversed: false, next: null};
        }
      }
    }

    // if (nodes = nodesByEnd.get(p1)) {
    //   var i = -1,
    //       n = nodes.length;
    //   while (++i < n) {
    //     node = nodes[i];
    //     if (equal(node.point, p0)) {
    //       return {start: node, reversed: false, next: null};
    //     }
    //   }
    // }

    if (nodes = nodesByStart.get(p1)) {
      var i = -1,
          n = nodes.length;
      while (++i < n) {
        node = nodes[i];
        if (equal(node.next.point, p0)) {
          return {start: node, reversed: true, next: null};
        }
      }
    }

    // if (nodes = nodesByEnd.get(p0)) {
    //   var i = -1,
    //       n = nodes.length;
    //   while (++i < n) {
    //     node = nodes[i];
    //     if (equal(node.point, p1)) {
    //       return {start: node, reversed: true, next: null};
    //     }
    //   }
    // }

    node = {point: p0, next: {point: p1, next: null}};
    nodeQueue.push(node);
    if (nodes = nodesByStart.get(p0)) nodes.push(node); else nodesByStart.set(p0, [node]);
    // if (nodes = nodesByEnd.get(p1)) nodes.push(node); else nodesByEnd.set(p1, [node]);
    return {start: node, reversed: false, next: null};
  }

  //   while (++pointIndex < pointCount) {
  //     previousPoint = currentPoint;
  //     currentPoint = points[pointIndex];

  //     var coarcs = arcsByPoint.get(currentPoint),
  //         coarcCount = coarcs.length,
  //         coarcIndex = -1,
  //         coarc;

  //     console.warn("segment " + previousPoint.name + currentPoint.name + " (" + coarcCount + " coarcs)");

  //     if (coarcCount > 0) {
  //       while (++coarcIndex < coarcCount) {
  //         coarc = coarcs[coarcIndex];

  //         //

  //         if (coarc.node.next) {
  //           // console.warn("coincident next segment " + currentPoint.name + coarc.next.point.name);
  //           if (equal(coarc.node.next.point, previousPoint)) {
  //             console.warn("matching reversed arc segment " + previousPoint.name + currentPoint.name);
  //           }
  //         }
  //         if (coarc.node.previous) {
  //           // console.warn("coincident previous segment " + coarc.node.previous.point.name + currentPoint.name);
  //           if (equal(coarc.node.previous.point, previousPoint)) {
  //             console.warn("matching arc segment " + previousPoint.name + currentPoint.name);

  //             if (currentArc) throw new Error("the current arc has preceeding nodes, and we don’t know yet how to cut it");
  //             if (coarc.node.previous.previous) throw new Error("the shared arc has preceeding nodes, and we don’t know yet how to cut it");
  //             currentArc = {reversed: false, start: coarc.node.previous, next: null};

  //             while (++pointIndex < pointCount) {
  //               previousPoint = currentPoint;
  //               currentPoint = points[pointIndex];
  //               coarc.node = coarc.node.next;
  //               if (!coarc.node) {
  //                 throw new Error("the shared arc has ended, but the current arc needs to keep going");
  //               } else if (!equal(coarc.node.point, currentPoint)) {
  //                 throw new Error("the shared arc deviated, and we don’t know yet how to cut it");
  //               }
  //             }

  //             if (pointIndex >= pointCount) {
  //               if (coarc.node.next) {
  //                 throw new Error("the shared arc keeps going, and we don’t know yet how to cut it");
  //               } else {
  //                 console.warn("we ended concurrently with the shared arc");
  //               }
  //             }
  //           }
  //         }
  //       }
  //     } else if (currentNode) {
  //       currentNode = currentNode.next = {point: currentPoint, previous: currentNode, next: null};
  //       coarcs.push(currentArc);
  //     } else {
  //       currentNode = currentArc.start = {point: previousPoint, previous: null, next: null};
  //       arcsByPoint.get(previousPoint).push(currentArc);
  //       coarcs.push(currentArc);
  //     }
  //   }

  //   console.warn("end " + currentPoint.name);

  //   // return firstArc;
  // }

  // The exact points don’t matter, as long as every point is unique.
  var A = [0, 0],
      B = [0, 1],
      C = [1, 0],
      D = [1, 1],
      E = [0, 2],
      F = [2, 0],
      G = [1, 2],
      H = [2, 1],
      I = [2, 2];

  A.name = "A";
  B.name = "B";
  C.name = "C";
  D.name = "D";
  E.name = "E";
  F.name = "F";
  G.name = "G";
  H.name = "H";
  I.name = "I";

  //
  //  A----B
  //  |\   |
  //  | \  |
  //  |  \ |
  //  |   \|
  //  D----C
  //

  console.log(stringify(line([A, B, C, A])));
  console.log(stringify(line([D, A, C, D])));
};

var hasher = require("./hash"),
    empty = [];

function hashtable(size, hash) {
  var hashtable = new Array(size);
  return {
    set: function(key, value) {
      var index = hash(key),
          matches = hashtable[index];

      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.key, key)) {
            return match.value = value;
          }
        }
      } else {
        matches = hashtable[index] = [];
      }

      matches.push(match = {key: key, value: value});
      return value;
    },
    get: function(key) {
      var matches = hashtable[hash(key)];
      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.key, key)) {
            return match.value;
          }
        }
      }
    }
  };
};

// We could use object identity equality if we interned points?
function equal(pointA, pointB) {
  return pointA[0] === pointB[0]
      && pointA[1] === pointB[1];
}

// Note: requires that size is a power of two!
function hashPoint(size) {
  var mask = size - 1;
  return function(point) {
    var key = (point[0] + 31 * point[1]) | 0;
    return (key < 0 ? ~key : key) & mask;
  };
}

function stringify(arc) {
  var arcs = [],
      node,
      point;
  while (arc) {
    node = arc.start;
    var points = [];
    while (node) {
      points.push(node.point.name);
      node = node.next;
    }
    if (arc.reversed) points.reverse();
    arcs.push(points.join(""));
    arc = arc.next;
  }
  return arcs.join("-");
}

// function merge(topology, arcs) {
//   var fragmentByStart = {},
//       fragmentByEnd = {};

//   arcs.forEach(function(i) {
//     var e = ends(i),
//         start = e[0],
//         end = e[1],
//         f, g;

//     if (f = fragmentByEnd[start]) {
//       delete fragmentByEnd[f.end];
//       f.push(i);
//       f.end = end;
//       if (g = fragmentByStart[end]) {
//         delete fragmentByStart[g.start];
//         var fg = g === f ? f : f.concat(g);
//         fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
//       } else if (g = fragmentByEnd[end]) {
//         delete fragmentByStart[g.start];
//         delete fragmentByEnd[g.end];
//         var fg = f.concat(g.map(function(i) { return ~i; }).reverse());
//         fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.start] = fg;
//       } else {
//         fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
//       }
//     } else if (f = fragmentByStart[end]) {
//       delete fragmentByStart[f.start];
//       f.unshift(i);
//       f.start = start;
//       if (g = fragmentByEnd[start]) {
//         delete fragmentByEnd[g.end];
//         var gf = g === f ? f : g.concat(f);
//         fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
//       } else if (g = fragmentByStart[start]) {
//         delete fragmentByStart[g.start];
//         delete fragmentByEnd[g.end];
//         var gf = g.map(function(i) { return ~i; }).reverse().concat(f);
//         fragmentByStart[gf.start = g.end] = fragmentByEnd[gf.end = f.end] = gf;
//       } else {
//         fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
//       }
//     } else if (f = fragmentByStart[start]) {
//       delete fragmentByStart[f.start];
//       f.unshift(~i);
//       f.start = end;
//       if (g = fragmentByEnd[end]) {
//         delete fragmentByEnd[g.end];
//         var gf = g === f ? f : g.concat(f);
//         fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
//       } else if (g = fragmentByStart[end]) {
//         delete fragmentByStart[g.start];
//         delete fragmentByEnd[g.end];
//         var gf = g.map(function(i) { return ~i; }).reverse().concat(f);
//         fragmentByStart[gf.start = g.end] = fragmentByEnd[gf.end = f.end] = gf;
//       } else {
//         fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
//       }
//     } else if (f = fragmentByEnd[end]) {
//       delete fragmentByEnd[f.end];
//       f.push(~i);
//       f.end = start;
//       if (g = fragmentByEnd[start]) {
//         delete fragmentByStart[g.start];
//         var fg = g === f ? f : f.concat(g);
//         fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
//       } else if (g = fragmentByStart[start]) {
//         delete fragmentByStart[g.start];
//         delete fragmentByEnd[g.end];
//         var fg = f.concat(g.map(function(i) { return ~i; }).reverse());
//         fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.start] = fg;
//       } else {
//         fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
//       }
//     } else {
//       f = [i];
//       fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
//     }
//   });

//   function ends(i) {
//     var arc = topology.arcs[i], p0 = arc[0], p1 = [0, 0];
//     arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
//     return [p0, p1];
//   }

//   var fragments = [];
//   for (var k in fragmentByEnd) fragments.push(fragmentByEnd[k]);
//   return fragments;
// }
