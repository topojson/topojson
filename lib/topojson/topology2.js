module.exports = function() {
  var nodesByPoint = hashtable(1 << 16);

  function line(points) {
    var pointIndex = 0,
        pointCount = points.length,
        previousPoint,
        currentPoint = points[0],
        currentNode,
        currentArc;
        // currentPoint = {point: p1, previous: null, next: null},
        // currentArc = {reversed: false, points: currentPoint, next: null},
        // firstArc = currentArc;

    console.warn("start " + currentPoint.name);

    // nodesByPoint.get(p1).push(currentPoint);

    while (++pointIndex < pointCount) {
      previousPoint = currentPoint;
      currentPoint = points[pointIndex];

      var coincidentNodes = nodesByPoint.get(currentPoint),
          coincidentNodeCount = coincidentNodes.length,
          coincidentNodeIndex = -1,
          coincidentNode;

      console.warn("segment " + previousPoint.name + currentPoint.name + " (" + coincidentNodeCount + " coincidences)");

      if (coincidentNodeCount > 0) {
        while (++coincidentNodeIndex < coincidentNodeCount) {
          coincidentNode = coincidentNodes[coincidentNodeIndex];
          if (coincidentNode.next) {
            // console.warn("coincident next segment " + currentPoint.name + coincidentNode.next.point.name);
            if (equal(coincidentNode.next.point, previousPoint)) {
              console.warn("matching reversed arc segment " + previousPoint.name + currentPoint.name);
            }
          }
          if (coincidentNode.previous) {
            // console.warn("coincident previous segment " + coincidentNode.previous.point.name + currentPoint.name);
            if (equal(coincidentNode.previous.point, previousPoint)) {
              console.warn("matching arc segment " + previousPoint.name + currentPoint.name);

              if (currentArc) throw new Error("the current arc has preceeding nodes, and we don’t know yet how to cut it");
              if (coincidentNode.previous.previous) throw new Error("the shared arc has preceeding nodes, and we don’t know yet how to cut it");
              currentArc = {reversed: false, points: coincidentNode.previous, next: null};

              while (++pointIndex < pointCount) {
                previousPoint = currentPoint;
                currentPoint = points[pointIndex];
                coincidentNode = coincidentNode.next;
                if (!coincidentNode) {
                  throw new Error("the shared arc has ended, but the current arc needs to keep going");
                } else if (!equal(coincidentNode.point, currentPoint)) {
                  throw new Error("the shared arc deviated, and we don’t know yet how to cut it");
                }
              }

              if (pointIndex >= pointCount) {
                if (coincidentNode.next) {
                  throw new Error("the shared arc keeps going, and we don’t know yet how to cut it");
                } else {
                  console.warn("we ended concurrently with the shared arc");
                }
              }
            }
          }
        }
      } else {
        if (!currentNode) nodesByPoint.get(previousPoint).push(currentNode = {point: previousPoint, previous: null, next: null});
        coincidentNodes.push(currentNode = currentNode.next = {point: currentPoint, previous: currentNode, next: null});
      }


      // var incidences = nodesByPoint.get(p1),
      //     incident,
      //     j = -1,
      //     m = incidences.length;

      // // currentPoint = currentPoint.next = {point: p1, previous: currentPoint, next: null};

      // if (m > 0) {
      //   while (++j < m) {
      //     incident = incidences[j];
      //     if (incident.next && equal(incident.next.point, p0)) {
      //       console.warn("matching reversed arc segment " + p0.name + p1.name);



      //       // keep advancing until the reverse arc deviates from our arc
      //       while ((incident = incident.previous) && ++i < n) {
      //         p0 = p1, p1 = points[i];
      //         if (!equal(incident.point, p1)) break;
      //         console.warn("another matching reversed arc segment " + p0.name + p1.name);
      //       }

      //       if (i < n) {
      //         console.warn("matching reversed arc did not finish this line");
      //       } else {
      //         console.warn("matching reversed arc finished this line");
      //       }
      //     } else if (incident.previous && equal(incident.previous.point, p0)) {
      //       console.warn("matching forward arc segment");
      //     } else if (incident.previous && incident.next) {
      //       console.warn("single shared point");
      //     } else {
      //       // console.warn("no need to split incident endpoint");
      //     }
      //   }

        // // If there was an incident point, and this isn’t an endpoint,
        // // terminate the current arc and start a new one.
        // if (i < n - 1) {
        //   currentPoint.previous.next = null;
        //   currentArc = currentArc.next = {reversed: false, points: currentPoint, next: null};
        // }
      // }

      // incidences.push(currentPoint);
    }

    console.warn("end " + currentPoint.name);

    // return firstArc;
  }

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

  line([A, B, C, D, E, F]);
  line([A, B, C, D, E, G]);

  // line([A, B, C, D]);
  // line([E, D, C, B]);

  // line([A, B, C, A]);
  // line([C, D, A, C]);
};

var hasher = require("./hash"),
    empty = [];

function hashtable(size) {
  var hashtable = new Array(size = 1 << Math.ceil(Math.log(size) / Math.LN2)),
      hash = hasher(size);
  return {
    size: size,
    peek: function(point) {
      var matches = hashtable[hash(point)];

      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.point, point)) {
            return match.values;
          }
        }
      }

      return empty;
    },
    get: function(point) {
      var index = hash(point),
          matches = hashtable[index];

      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.point, point)) {
            return match.values;
          }
        }
      } else {
        matches = hashtable[index] = [];
      }

      var values = [];
      matches.push({point: point, values: values});
      return values;
    }
  };
};

// We could use object identity equality if we interned points?
function equal(pointA, pointB) {
  return pointA[0] === pointB[0]
      && pointA[1] === pointB[1];
}

// Note: requires that size is a power of two!
function hasher(size) {
  var mask = size - 1;
  return function(point) {
    var key = (point[0] + 31 * point[1]) | 0;
    return (key < 0 ? ~key : key) & mask;
  };
}
