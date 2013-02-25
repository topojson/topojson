var vows = require("vows"),
    assert = require("assert"),
    area = require("../lib/topojson/area");

var suite = vows.describe("topojson.area");

suite.addBatch({
  "area": {
    topic: function() {
      return area;
    },
    "small clockwise area": function(area) {
      assert.inDelta(area([[0, -.5], [0, .5], [1, .5], [1, -.5], [0, -.5]]), 0.0003046212, 1e-10);
    },
    "small counterclockwise area": function(area) {
      assert.inDelta(area([[0, -.5], [1, -.5], [1, .5], [0, .5], [0, -.5]]), -0.0003046212, 1e-10);
    }
  }
});

suite.export(module);
