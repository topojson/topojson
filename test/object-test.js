var vows = require("vows"),
    assert = require("assert"),
    topojson = require("../");

var suite = vows.describe("topojson.object");

suite.addBatch({
  "object": {
    "polygons are always closed, with at least four coordinates": function() {
      var topology = {
        type: "Topology",
        transform: {scale: [1, 1], translate: [0, 0]},
        objects: {foo: {type: "Polygon", arcs: [[0]]}, bar: {type: "Polygon", arcs: [[0, 1]]}},
        arcs: [[[0, 0], [1, 1]], [[1, 1], [-1, -1]]]
      };
      assert.deepEqual([[[0, 0], [1, 1], [0, 0], [0, 0]]], topojson.object(topology, topology.objects.foo).coordinates);
      assert.deepEqual([[[0, 0], [1, 1], [0, 0], [0, 0]]], topojson.object(topology, topology.objects.bar).coordinates);
    },
    "unknown geometry types are converted to null geometry": function() {
      var topology = {
        type: "Topology",
        transform: {scale: [1, 1], translate: [0, 0]},
        objects: {foo: {}, bar: {type: "Invalid"}, baz: {type: "Point", coordinates: [0, 0]}},
        arcs: []
      };
      assert.isNull(topojson.object(topology, topology.objects.foo));
      assert.isNull(topojson.object(topology, topology.objects.bar));
      assert.equal("Point", topojson.object(topology, topology.objects.baz).type);
      assert.deepEqual([0, 0], topojson.object(topology, topology.objects.baz).coordinates);
    }
  }
});

suite.export(module);
