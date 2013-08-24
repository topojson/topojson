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
    "includes closing point in polygons": function() {
      var topology = arcify({
        foo: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
        }
      });
      assert.deepEqual(Array.apply([], topology.points), [0, 0, 1, 0, 2, 0, 0, 0]);
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
          coordinates: {start: 0, end: 3, next: null}
        },
        bar: {
          type: "LineString",
          coordinates: {start: 3, end: 6, next: null}
        }
      });
    },
    "records every arc’s occurrences by point": function() {
      var topology = arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 1], [1, 0], [2, 0], [3, 1]]
        }
      });
      var arcFoo = topology.objects.foo.coordinates,
          arcBar = topology.objects.bar.coordinates;
      assert.deepEqual(topology.occurrences.get([0, 0]), [arcFoo]);
      assert.deepEqual(topology.occurrences.get([0, 1]), [arcBar]);
      assert.deepEqual(topology.occurrences.get([1, 0]), [arcFoo, arcBar]);
      assert.deepEqual(topology.occurrences.get([2, 0]), [arcFoo, arcBar]);
      assert.deepEqual(topology.occurrences.get([3, 1]), [arcBar]);
      assert.isUndefined(topology.occurrences.get([1, 1]));
    },
    "for closed arcs, records only one occurrence on endpoint": function() {
      var topology = arcify({
        foo: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
        }
      });
      var arcFoo = topology.objects.foo.coordinates[0];
      assert.deepEqual(topology.occurrences.get([0, 0]), [arcFoo]);
      assert.deepEqual(topology.occurrences.get([1, 0]), [arcFoo]);
      assert.deepEqual(topology.occurrences.get([2, 0]), [arcFoo]);
      assert.isUndefined(topology.occurrences.get([1, 1]));
    }
  }
});

suite.export(module);
