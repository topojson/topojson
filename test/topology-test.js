require("../topojson");

var topology = require("../lib/topojson/topology");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("topojson.topology");

suite.addBatch({
  "topology": {
    topic: function() {
      return topology;
    },
    "LineString": function(topology) {
      assert.deepEqual(topology([
        {type: "LineString", coordinates: [[0, 0], [0, 1], [1, 1], [0, 0]]},
        {type: "LineString", coordinates: [[0, 0], [0, 1], [1, 1], [1, 2]]}
      ], {quantization: 3}), {
        type: "Topology",
        arcs: [[[0, 0], [0, 1], [2, 0], [-2, -1]],
               [[0, 0], [0, 1], [2, 0]],
               [[2, 1], [0, 1], [-2, -2]]],
        objects: {0: {type: "LineString", arcs: [0]}, 1: {type: "LineString", arcs: [1, 2]}},
        transform: {translate: [0, 0], scale: [.5, 1]}
      });
    },
    "Polygon": function(topology) {
      assert.deepEqual(topology([
        {type: "Polygon", coordinates: [[[0, 0], [0, 2], [1, 2], [1, 1], [2, 1], [2, 0], [0, 0]]]},
        {type: "Polygon", coordinates: [[[3, 3], [3, 1], [2, 1], [2, 2], [1, 2], [1, 3], [3, 3]]]},
        {type: "Polygon", coordinates: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]},
      ], {quantization: 4}), {
        type: "Topology",
        arcs: [[[1, 2], [0, -1], [1, 0]],
               [[2, 1], [0, -1], [-2, 0], [0, 2], [1, 0]],
               [[2, 1], [0, 1], [-1, 0]],
               [[1, 2], [0, 1], [2, 0], [0, -2], [-1, 0]]],
        objects: {0: {type: "Polygon", arcs: [[0, 1]]}, 1: {type: "Polygon", arcs: [[2, 3]]}, 2: {type: "Polygon", arcs: [[-3, -1]]}},
        transform: {translate: [0, 0], scale: [1, 1]}
      });
    }
  }
});

suite.export(module);

assert.inDelta = function(actual, expected, delta, message) {
  if (!inDelta(actual, expected, delta)) {
    assert.fail(actual, expected, message || "expected {actual} to be in within *" + delta + "* of {expected}", null, assert.inDelta);
  }
};

function inDelta(actual, expected, delta) {
  return (Array.isArray(expected) ? inDeltaArray : inDeltaNumber)(actual, expected, delta);
}

function inDeltaArray(actual, expected, delta) {
  var n = expected.length, i = -1;
  if (actual.length !== n) return false;
  while (++i < n) if (!inDelta(actual[i], expected[i], delta)) return false;
  return true;
}

function inDeltaNumber(actual, expected, delta) {
  return actual >= expected - delta && actual <= expected + delta;
}
