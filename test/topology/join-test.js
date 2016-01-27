var tape = require("tape"),
    extract = require("../../lib/topojson/topology/extract"),
    join = require("../../lib/topojson/topology/join");

tape("join the returned hashmap has true for junction points", function(test) {
  var junctions = join(extract({
    cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
    ab: {type: "LineString", coordinates: [[0, 0], [1, 0]]}
  }));
  test.equal(junctions.has([2, 0]), true);
  test.equal(junctions.has([0, 0]), true);
  test.end();
});

tape("join the returned hashmap has undefined for non-junction points", function(test) {
  var junctions = join(extract({
    cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
    ab: {type: "LineString", coordinates: [[0, 0], [2, 0]]}
  }));
  test.equal(junctions.has([1, 0]), false);
  test.end();
});

tape("join exact duplicate lines ABC & ABC have junctions at their end points", function(test) {
  var junctions = join(extract({
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    abc2: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [2, 0]]);
  test.end();
});

tape("join reversed duplicate lines ABC & CBA have junctions at their end points", function(test) {
  var junctions = join(extract({
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [2, 0]]);
  test.end();
});

tape("join exact duplicate rings ABCA & ABCA have no junctions", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
    abca2: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]}
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join reversed duplicate rings ACBA & ABCA have no junctions", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
    acba: {type: "Polygon", coordinates: [[[0, 0], [2, 0], [1, 0], [0, 0]]]}
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join rotated duplicate rings BCAB & ABCA have no junctions", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
    bcab: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [0, 0], [1, 0]]]}
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join ring ABCA & line ABCA have a junction at A", function(test) {
  var junctions = join(extract({
    abcaLine: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [0, 0]]},
    abcaPolygon: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
  }));
  testSetEqual(test, junctions.values(), [[0, 0]]);
  test.end();
});

tape("join ring BCAB & line ABCA have a junction at A", function(test) {
  var junctions = join(extract({
    abcaLine: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [0, 0]]},
    bcabPolygon: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [0, 0], [1, 0]]]},
  }));
  testSetEqual(test, junctions.values(), [[0, 0]]);
  test.end();
});

tape("join ring ABCA & line BCAB have a junction at B", function(test) {
  var junctions = join(extract({
    bcabLine: {type: "LineString", coordinates: [[1, 0], [2, 0], [0, 0], [1, 0]]},
    abcaPolygon: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
  }));
  testSetEqual(test, junctions.values(), [[1, 0]]);
  test.end();
});

tape("join when an old arc ABC extends a new arc AB, there is a junction at B", function(test) {
  var junctions = join(extract({
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    ab: {type: "LineString", coordinates: [[0, 0], [1, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [1, 0], [2, 0]]);
  test.end();
});

tape("join when a reversed old arc CBA extends a new arc AB, there is a junction at B", function(test) {
  var junctions = join(extract({
    cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
    ab: {type: "LineString", coordinates: [[0, 0], [1, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [1, 0], [2, 0]]);
  test.end();
});

tape("join when a new arc ADE shares its start with an old arc ABC, there is a junction at A", function(test) {
  var junctions = join(extract({
    ade: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    abc: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [2, 0], [2, 1]]);
  test.end();
});

tape("join ring ABA has no junctions", function(test) {
  var junctions = join(extract({
    aba: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 0]]]},
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join ring AA has no junctions", function(test) {
  var junctions = join(extract({
    aa: {type: "Polygon", coordinates: [[[0, 0], [0, 0]]]},
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join degenerate ring A has no junctions", function(test) {
  var junctions = join(extract({
    a: {type: "Polygon", coordinates: [[[0, 0]]]},
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join when a new line DEC shares its end with an old line ABC, there is a junction at C", function(test) {
  var junctions = join(extract({
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    dec: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [2, 0], [0, 1]]);
  test.end();
});

tape("join when a new line ABC extends an old line AB, there is a junction at B", function(test) {
  var junctions = join(extract({
    ab: {type: "LineString", coordinates: [[0, 0], [1, 0]]},
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [1, 0], [2, 0]]);
  test.end();
});

tape("join when a new line ABC extends a reversed old line BA, there is a junction at B", function(test) {
  var junctions = join(extract({
    ba: {type: "LineString", coordinates: [[1, 0], [0, 0]]},
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [1, 0], [2, 0]]);
  test.end();
});

tape("join when a new line starts BC in the middle of an old line ABC, there is a junction at B", function(test) {
  var junctions = join(extract({
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    bc: {type: "LineString", coordinates: [[1, 0], [2, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [1, 0], [2, 0]]);
  test.end();
});

tape("join when a new line BC starts in the middle of a reversed old line CBA, there is a junction at B", function(test) {
  var junctions = join(extract({
    cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
    bc: {type: "LineString", coordinates: [[1, 0], [2, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [1, 0], [2, 0]]);
  test.end();
});

tape("join when a new line ABD deviates from an old line ABC, there is a junction at B", function(test) {
  var junctions = join(extract({
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    abd: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [2, 0], [1, 0], [3, 0]]);
  test.end();
});

tape("join when a new line ABD deviates from a reversed old line CBA, there is a junction at B", function(test) {
  var junctions = join(extract({
    cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
    abd: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[2, 0], [0, 0], [1, 0], [3, 0]]);
  test.end();
});

tape("join when a new line DBC merges into an old line ABC, there is a junction at B", function(test) {
  var junctions = join(extract({
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    dbc: {type: "LineString", coordinates: [[3, 0], [1, 0], [2, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [2, 0], [1, 0], [3, 0]]);
  test.end();
});

tape("join when a new line DBC merges into a reversed old line CBA, there is a junction at B", function(test) {
  var junctions = join(extract({
    cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
    dbc: {type: "LineString", coordinates: [[3, 0], [1, 0], [2, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[2, 0], [0, 0], [1, 0], [3, 0]]);
  test.end();
});

tape("join when a new line DBE shares a single midpoint with an old line ABC, there is a junction at B", function(test) {
  var junctions = join(extract({
    abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
    dbe: {type: "LineString", coordinates: [[0, 1], [1, 0], [2, 1]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [2, 0], [2, 1], [1, 0], [0, 1]]);
  test.end();
});

tape("join when a new line ABDE skips a point with an old line ABCDE, there is a junction at B and D", function(test) {
  var junctions = join(extract({
    abcde: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]},
    abde: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [4, 0], [1, 0], [3, 0]]);
  test.end();
});

tape("join when a new line ABDE skips a point with a reversed old line EDCBA, there is a junction at B and D", function(test) {
  var junctions = join(extract({
    edcba: {type: "LineString", coordinates: [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]]},
    abde: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[4, 0], [0, 0], [1, 0], [3, 0]]);
  test.end();
});

tape("join when a line ABCDBE self-intersects with its middle, there are no junctions", function(test) {
  var junctions = join(extract({
    abcdbe: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [4, 0]]);
  test.end();
});

tape("join when a line ABACD self-intersects with its start, there are no junctions", function(test) {
  var junctions = join(extract({
    abacd: {type: "LineString", coordinates: [[0, 0], [1, 0], [0, 0], [3, 0], [4, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [4, 0]]);
  test.end();
});

tape("join when a line ABCDBD self-intersects with its end, there are no junctions", function(test) {
  var junctions = join(extract({
    abcdbd: {type: "LineString", coordinates: [[0, 0], [1, 0], [4, 0], [3, 0], [4, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [4, 0]]);
  test.end();
});

tape("join when an old line ABCDBE self-intersects and shares a point B, there is a junction at B", function(test) {
  var junctions = join(extract({
    abcdbe: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]},
    fbg: {type: "LineString", coordinates: [[0, 1], [1, 0], [2, 1]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0], [4, 0], [1, 0], [0, 1], [2, 1]]);
  test.end();
});

tape("join when a line ABCA is closed, there is a junction at A", function(test) {
  var junctions = join(extract({
    abca: {type: "LineString", coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]}
  }));
  testSetEqual(test, junctions.values(), [[0, 0]]);
  test.end();
});

tape("join when a ring ABCA is closed, there are no junctions", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]}
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join exact duplicate rings ABCA & ABCA share the arc ABCA", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    abca2: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]}
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join reversed duplicate rings ABCA & ACBA share the arc ABCA", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    acba: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 0], [0, 0]]]}
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join coincident rings ABCA & BCAB share the arc BCAB", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    bcab: {type: "Polygon", coordinates: [[[1, 0], [0, 1], [0, 0], [1, 0]]]}
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join coincident rings ABCA & BACB share the arc BCAB", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    bacb: {type: "Polygon", coordinates: [[[1, 0], [0, 0], [0, 1], [1, 0]]]}
  }));
  testSetEqual(test, junctions.values(), []);
  test.end();
});

tape("join coincident rings ABCA & DBED share the point B", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    dbed: {type: "Polygon", coordinates: [[[2, 1], [1, 0], [2, 2], [2, 1]]]}
  }));
  testSetEqual(test, junctions.values(), [[1, 0]]);
  test.end();
});

tape("join coincident ring ABCA & line DBE share the point B", function(test) {
  var junctions = join(extract({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    dbe: {type: "LineString", coordinates: [[2, 1], [1, 0], [2, 2]]}
  }));
  testSetEqual(test, junctions.values(), [[2, 1], [2, 2], [1, 0]]);
  test.end();
});

function testSetEqual(test, pointsA, pointsB) {
  test.deepEqual(pointsA.sort(comparePoint), pointsB.sort(comparePoint));
}

function comparePoint(pointA, pointB) {
  return pointA[0] - pointB[0] || pointA[1] - pointB[1];
}
