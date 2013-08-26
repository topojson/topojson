var vows = require("vows"),
    assert = require("assert"),
    quantize = require("../../lib/topojson/topology/quantize");

var suite = vows.describe("quantize");

suite.addBatch({
  "quantize": {
    "computes the quantization transform": function() {
      assert.deepEqual(quantize({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [0, 1], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            arcs: [0]
          }
        }
      }).transform, {
        scale: [1 / 9999, 1 / 9999],
        translate: [0, 0]
      });
    },
    "converts arcs to fixed-point delta encoding": function() {
      assert.deepEqual(quantize({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [0, 1], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            arcs: [0]
          }
        }
      }).arcs, [
        [[0, 0], [9999, 0], [-9999, 9999], [0, -9999]]
      ]);
    },
    "uses a default quantization of 1e4": function() {
      assert.deepEqual(quantize({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [0, 1], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            arcs: [0]
          }
        }
      }).arcs, [
        [[0, 0], [9999, 0], [-9999, 9999], [0, -9999]]
      ]);
    },
    "observes the optional quantization parameter": function() {
      assert.deepEqual(quantize({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [0, 1], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            arcs: [0]
          }
        }
      }, 10).arcs, [
        [[0, 0], [9, 0], [-9, 9], [0, -9]]
      ]);
    },
    "observes the topology’s precomputed bounding box": function() {
      assert.deepEqual(quantize({
        type: "Topology",
        bbox: [-1, -1, 2, 2],
        arcs: [
          [[0, 0], [1, 0], [0, 1], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            arcs: [0]
          }
        }
      }, 10).arcs, [
        [[3, 3], [3, 0], [-3, 3], [0, -3]]
      ]);
    },
    "applies to points as well as arcs": function() {
      assert.deepEqual(quantize({
        type: "Topology",
        arcs: [],
        objects: {
          foo: {
            type: "MultiPoint",
            coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
          }
        }
      }).objects.foo.coordinates, [[0, 0], [9999, 0], [0, 9999], [0, 0]]);
    },
    "skips coincident points post quantization": function() {
      assert.deepEqual(quantize({
        type: "Topology",
        arcs: [
          [[0, 0], [0.9, 0.9], [1.1, 1.1], [2, 2]]
        ],
        objects: {
          foo: {
            type: "LineString",
            arcs: [0]
          }
        }
      }, 3).arcs, [
        [[0, 0], [1, 1], [1, 1]]
      ]);
    }
  }
});

suite.export(module);
