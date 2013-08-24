var vows = require("vows"),
    assert = require("assert"),
    arcify = require("../../lib/topojson/topology/arcify");

var suite = vows.describe("arcify");

suite.addBatch({
  "arcify": {
    "copies points sequentially into a buffer": function() {
      var topology = arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      });
      assert.deepEqual(Array.apply([], topology.points), [0, 0, 1, 0, 2, 0, 0, 0, 1, 0, 2, 0]);
    },
    "represents arcs as indexes into the point buffer": function() {
      var topology = arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      });
      assert.deepEqual(topology.objects, {
        foo: {
          type: "LineString",
          coordinates: {
            start: 0,
            end: 3,
            next: null
          }
        },
        bar: {
          type: "LineString",
          coordinates: {
            start: 3,
            end: 6,
            next: null
          }
        }
      })
    }
  }
});

suite.export(module);
