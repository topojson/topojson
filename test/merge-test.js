var vows = require("vows"),
    assert = require("assert"),
    topojson = require("../"),
    merge = require("../lib/topojson/merge");

var suite = vows.describe("merge");

suite.addBatch({
  "merge": {
    "stitches together two connected line strings": function() {
      var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
        {type: "Feature", id: "foo", geometry: {type: "LineString", coordinates: [[1, 0], [2, 0]]}},
        {type: "Feature", id: "foo", geometry: {type: "LineString", coordinates: [[0, 0], [1, 0]]}}
      ]}});
      assert.deepEqual(merge(topology, topology.objects.collection), {
        type: "LineString",
        arcs: [1, 0],
        id: "foo"
      });
    },
    "does not stitch together two disconnected line strings": function() {
      var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
        {type: "Feature", id: "foo", geometry: {type: "LineString", coordinates: [[2, 0], [3, 0]]}},
        {type: "Feature", id: "foo", geometry: {type: "LineString", coordinates: [[0, 0], [1, 0]]}}
      ]}});
      assert.deepEqual(merge(topology, topology.objects.collection), {
        type: "MultiLineString",
        arcs: [[0], [1]],
        id: "foo"
      });
    },
    "stitches together two adjacent polygons": function() {
      var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
        {type: "Feature", id: "foo", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]}},
        {type: "Feature", id: "foo", geometry: {type: "Polygon", coordinates: [[[1, 0], [1, 1], [2, 1], [2, 0], [1, 0]]]}}
      ]}}, {
        quantization: 0
      });
      assert.deepEqual(merge(topology, topology.objects.collection), {
        type: "Polygon",
        arcs: [[1, 2]],
        id: "foo"
      });
    },
    "stitches together two adjacent polygons with a hole": function() {
      var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
        {type: "Feature", id: "foo", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]], [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]}},
        {type: "Feature", id: "foo", geometry: {type: "Polygon", coordinates: [[[3, 0], [3, 6], [6, 6], [6, 3], [3, 0]]]}}
      ]}}, {
        quantization: 0
      });
      assert.deepEqual(merge(topology, topology.objects.collection), {
        type: "Polygon",
        arcs: [[0, 2], [1]],
        id: "foo"
      });
    },
    "does not stitch together two disparate polygons": function() {
      var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
        {type: "Feature", id: "foo", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]}},
        {type: "Feature", id: "foo", geometry: {type: "Polygon", coordinates: [[[2, 0], [2, 1], [3, 1], [3, 0], [2, 0]]]}}
      ]}}, {
        quantization: 0
      });
      assert.deepEqual(merge(topology, topology.objects.collection), {
        type: "MultiPolygon",
        arcs: [[[0]], [[1]]],
        id: "foo"
      });
    },
    "does not stitch together a polygon and its hole": function() {
      var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
        {type: "Feature", id: "foo", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]], [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]}}
      ]}}, {
        quantization: 0
      });
      assert.deepEqual(merge(topology, topology.objects.collection), {
        type: "Polygon",
        arcs: [[0], [1]],
        id: "foo"
      });
    }
  }
});

suite.export(module);
