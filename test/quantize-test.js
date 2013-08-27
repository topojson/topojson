var vows = require("vows"),
    assert = require("assert"),
    d3 = require("d3"),
    quantize = require("../lib/topojson/quantize");

var suite = vows.describe("quantize");

suite.addBatch({
  "quantize": {
    "computes the quantization transform": function() {
      assert.deepEqual(quantize([0, 0, 1, 1], 1e4).transform, {
        scale: [1 / 9999, 1 / 9999],
        translate: [0, 0]
      });
    },
    "converts arcs to fixed precision": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "LineString",
        coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
      }, quantize([0, 0, 1, 1], 1e4)(sink));
      assert.deepEqual(sink.points, [
        [0, 0], [9999, 0], [0, 9999], [0, 0]
      ]);
    },
    "observes the quantization parameter": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "LineString",
        coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
      }, quantize([0, 0, 1, 1], 10)(sink));
      assert.deepEqual(sink.points, [
        [0, 0], [9, 0], [0, 9], [0, 0]
      ]);
    },
    "observes the bounding box": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "LineString",
        coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
      }, quantize([-1, -1, 2, 2], 10)(sink));
      assert.deepEqual(sink.points, [
        [3, 3], [6, 3], [3, 6], [3, 3]
      ]);
    },
    "applies to points as well as arcs": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "MultiPoint",
        coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
      }, quantize([0, 0, 1, 1], 1e4)(sink));
      assert.deepEqual(sink.points, [
        [0, 0], [9999, 0], [0, 9999], [0, 0]
      ]);
    },
    "skips coincident points in lines": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "LineString",
        coordinates: [[0, 0], [0.9, 0.9], [1.1, 1.1], [2, 2]]
      }, quantize([0, 0, 2, 2], 3)(sink));
      assert.deepEqual(sink.points, [
        [0, 0], [1, 1], [2, 2]
      ]);
    },
    "skips coincident points in polygons": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "Polygon",
        coordinates: [[[0, 0], [0.9, 0.9], [1.1, 1.1], [2, 2], [0, 0]]]
      }, quantize([0, 0, 2, 2], 3)(sink));
      assert.deepEqual(sink.points, [
        [0, 0], [1, 1], [2, 2]
      ]);
    },
    "does not skip coincident points in points": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "MultiPoint",
        coordinates: [[0, 0], [0.9, 0.9], [1.1, 1.1], [2, 2], [0, 0]]
      }, quantize([0, 0, 2, 2], 3)(sink));
      assert.deepEqual(sink.points, [
        [0, 0], [1, 1], [1, 1], [2, 2], [0, 0]
      ]);
    },
    "includes closing point in degenerate lines": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "LineString",
        coordinates: [[1, 1], [1, 1], [1, 1]]
      }, quantize([0, 0, 2, 2], 3)(sink));
      assert.deepEqual(sink.points, [
        [1, 1], [1, 1]
      ]);
    },
    "includes closing point in degenerate polygons": function() {
      var sink = bufferStream();
      d3.geo.stream({
        type: "Polygon",
        coordinates: [[[1, 1], [1, 1], [1, 1], [1, 1]]]
      }, quantize([0, 0, 2, 2], 3)(sink));
      assert.deepEqual(sink.points, [
        [1, 1], [1, 1]
      ]);
    }
  }
});

function bufferStream() {
  return {
    points: [],
    point: function(x, y) { this.points.push([x, y]); },
    lineStart: function() {},
    lineEnd: function() {},
    polygonStart: function() {},
    polygonEnd: function() {}
  };
};

suite.export(module);
