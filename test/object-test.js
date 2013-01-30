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
        objects: {polygon: {type: "Polygon", arcs: [[0]]}},
        arcs: [[[0, 0], [1, 1]]]
      };
      assert.deepEqual([[[0, 0], [1, 1], [0, 0], [0, 0]]], topojson.object(topology, topology.objects.polygon).coordinates);
    }
  }
});

suite.export(module);
