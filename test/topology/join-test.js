var vows = require("vows"),
    assert = require("assert"),
    linearize = require("../../lib/topojson/topology/linearize"),
    join = require("../../lib/topojson/topology/join");

var suite = vows.describe("join");

suite.addBatch({
  "join": {
    "the returned hashtable has true for junction points": function() {
      var junctionByPoint = join(linearize({
        cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
        ab: {type: "LineString", coordinates: [[0, 0], [1, 0]]}
      }));
      assert.isTrue(junctionByPoint.get([2, 0]));
      assert.isTrue(junctionByPoint.get([0, 0]));
    },
    "the returned hashtable has undefined for non-junction points": function() {
      var junctionByPoint = join(linearize({
        cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
        ab: {type: "LineString", coordinates: [[0, 0], [2, 0]]}
      }));
      assert.isUndefined(junctionByPoint.get([1, 0]));
    },
    "exact duplicate lines ABC & ABC have junctions at their end points": function() {
      var junctionByPoint = join(linearize({
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        abc2: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [2, 0]]);
    },
    "reversed duplicate lines ABC & CBA have junctions at their end points": function() {
      var junctionByPoint = join(linearize({
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [2, 0]]);
    },
    "exact duplicate rings ABCA & ABCA have no junctions": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
        abca2: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "reversed duplicate rings ACBA & ABCA have no junctions": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
        acba: {type: "Polygon", coordinates: [[[0, 0], [2, 0], [1, 0], [0, 0]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "rotated duplicate rings BCAB & ABCA have no junctions": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
        bcab: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [0, 0], [1, 0]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "ring ABCA & line ABCA have a junction at A": function() {
      var junctionByPoint = join(linearize({
        abcaLine: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [0, 0]]},
        abcaPolygon: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0]]);
    },
    "ring BCAB & line ABCA have a junction at A": function() {
      var junctionByPoint = join(linearize({
        abcaLine: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [0, 0]]},
        bcabPolygon: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [0, 0], [1, 0]]]},
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0]]);
    },
    "ring ABCA & line BCAB have a junction at B": function() {
      var junctionByPoint = join(linearize({
        bcabLine: {type: "LineString", coordinates: [[1, 0], [2, 0], [0, 0], [1, 0]]},
        abcaPolygon: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]},
      }));
      assert.deepEqual(junctionByPoint.keys(), [[1, 0]]);
    },
    "when an old arc ABC extends a new arc AB, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        ab: {type: "LineString", coordinates: [[0, 0], [1, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [1, 0], [2, 0]]);
    },
    "when a reversed old arc CBA extends a new arc AB, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
        ab: {type: "LineString", coordinates: [[0, 0], [1, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [1, 0], [2, 0]]);
    },
    "when a new arc ADE shares its start with an old arc ABC, there is a junction at A": function() {
      var junctionByPoint = join(linearize({
        ade: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        abc: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [2, 0], [2, 1]]);
    },
    "ring ABA has no junctions": function() {
      var junctionByPoint = join(linearize({
        aba: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 0]]]},
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "ring AA has no junctions": function() {
      var junctionByPoint = join(linearize({
        aa: {type: "Polygon", coordinates: [[[0, 0], [0, 0]]]},
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "degenerate ring A has no junctions": function() {
      var junctionByPoint = join(linearize({
        a: {type: "Polygon", coordinates: [[[0, 0]]]},
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "when a new line DEC shares its end with an old line ABC, there is a junction at C": function() {
      var junctionByPoint = join(linearize({
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        dec: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [2, 0], [0, 1]]);
    },
    "when a new line ABC extends an old line AB, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        ab: {type: "LineString", coordinates: [[0, 0], [1, 0]]},
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [1, 0], [2, 0]]);
    },
    "when a new line ABC extends a reversed old line BA, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        ba: {type: "LineString", coordinates: [[1, 0], [0, 0]]},
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [1, 0], [2, 0]]);
    },
    "when a new line starts BC in the middle of an old line ABC, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        bc: {type: "LineString", coordinates: [[1, 0], [2, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [1, 0], [2, 0]]);
    },
    "when a new line BC starts in the middle of a reversed old line CBA, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
        bc: {type: "LineString", coordinates: [[1, 0], [2, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [1, 0], [2, 0]]);
    },
    "when a new line ABD deviates from an old line ABC, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        abd: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [2, 0], [1, 0], [3, 0]]);
    },
    "when a new line ABD deviates from a reversed old line CBA, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
        abd: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[2, 0], [0, 0], [1, 0], [3, 0]]);
    },
    "when a new line DBC merges into an old line ABC, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        dbc: {type: "LineString", coordinates: [[3, 0], [1, 0], [2, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [2, 0], [1, 0], [3, 0]]);
    },
    "when a new line DBC merges into a reversed old line CBA, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        cba: {type: "LineString", coordinates: [[2, 0], [1, 0], [0, 0]]},
        dbc: {type: "LineString", coordinates: [[3, 0], [1, 0], [2, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[2, 0], [0, 0], [1, 0], [3, 0]]);
    },
    "when a new line DBE shares a single midpoint with an old line ABC, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        abc: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0]]},
        dbe: {type: "LineString", coordinates: [[0, 1], [1, 0], [2, 1]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [2, 0], [2, 1], [1, 0], [0, 1]]);
    },
    "when a new line ABDE skips a point with an old line ABCDE, there is a junction at B and D": function() {
      var junctionByPoint = join(linearize({
        abcde: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]},
        abde: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [4, 0], [1, 0], [3, 0]]);
    },
    "when a new line ABDE skips a point with a reversed old line EDCBA, there is a junction at B and D": function() {
      var junctionByPoint = join(linearize({
        edcba: {type: "LineString", coordinates: [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]]},
        abde: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[4, 0], [0, 0], [1, 0], [3, 0]]);
    },
    "when an line ABCDBE self-intersects with its middle, there are no junctions": function() {
      var junctionByPoint = join(linearize({
        abcdbe: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [4, 0]]);
    },
    "when an line ABACD self-intersects with its start, there are no junctions": function() {
      var junctionByPoint = join(linearize({
        abacd: {type: "LineString", coordinates: [[0, 0], [1, 0], [0, 0], [3, 0], [4, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [4, 0]]);
    },
    "when an line ABCDBD self-intersects with its end, there are no junctions": function() {
      var junctionByPoint = join(linearize({
        abcdbd: {type: "LineString", coordinates: [[0, 0], [1, 0], [4, 0], [3, 0], [4, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [4, 0]]);
    },
    "when an old line ABCDBE self-intersects and shares a point B, there is a junction at B": function() {
      var junctionByPoint = join(linearize({
        abcdbe: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]},
        fbg: {type: "LineString", coordinates: [[0, 1], [1, 0], [2, 1]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0], [4, 0], [1, 0], [0, 1], [2, 1]]);
    },
    "when an line ABCA is closed, there is a junction at A": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "LineString", coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[0, 0]]);
    },
    "when a ring ABCA is closed, there are no junctions": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "exact duplicate rings ABCA & ABCA share the arc ABCA": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
        abca2: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "reversed duplicate rings ABCA & ACBA share the arc ABCA": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
        acba: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 0], [0, 0]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "coincident rings ABCA & BCAB share the arc BCAB": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
        bcab: {type: "Polygon", coordinates: [[[1, 0], [0, 1], [0, 0], [1, 0]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "coincident rings ABCA & BACB share the arc BCAB": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
        bacb: {type: "Polygon", coordinates: [[[1, 0], [0, 0], [0, 1], [1, 0]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), []);
    },
    "coincident rings ABCA & DBE share the point B": function() {
      var junctionByPoint = join(linearize({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
        dbe: {type: "Polygon", coordinates: [[[2, 1], [1, 0], [2, 2]]]}
      }));
      assert.deepEqual(junctionByPoint.keys(), [[1, 0]]);
    }
  }
});

suite.export(module);
