var vows = require("vows"),
    assert = require("assert"),
    bounds = require("../../lib/topojson/topology/bounds");

var suite = vows.describe("bounds");

suite.addBatch({
  "bounds": {
    "computes the bounding box": function() {
      assert.deepEqual(bounds({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [0, 2], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          }
        }
      }), [0, 0, 1, 2]);
    }
  }
});

suite.export(module);
