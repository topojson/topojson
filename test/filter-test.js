var vows = require("vows"),
    assert = require("assert"),
    topojson = require("../");

var suite = vows.describe("topojson.filter");

suite.addBatch({
  "filter": {
    topic: function() {
      return topojson.filter;
    },
    "null geometry objects are preserved": function(filter) {
      var topology = topojson.topology({
        feature: {type: "Feature", geometry: null},
        geometry: null
      });
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.feature, {});
      assert.deepEqual(topology.objects.geometry, {});
    },
    "empty geometry objects are converted to null": function(filter) {
      var topology = topojson.topology({line: {type: "Polygon", coordinates: [[[0, 0], [1, 1], [1, 1], [0, 0]]]}});
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.line, {type: null});
    },
    "small geometry objects are converted to null": function(filter) {
      var topology = topojson.topology({polygon: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}});
      filter(topology, {"coordinate-system": "spherical", "minimum-area": .5});
      assert.deepEqual(topology.objects.polygon, {type: null});
    },
    "big geometry objects are preserved": function(filter) {
      var topology = topojson.topology({polygon: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]}});
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.polygon, {type: "Polygon", arcs: [[0]]});
    }
  }
});

suite.export(module);
