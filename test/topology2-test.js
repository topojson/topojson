var vows = require("vows"),
    assert = require("assert"),
    topology2 = require("../lib/topojson/topology2");

var suite = vows.describe("topology2");

suite.addBatch({
  "topology2": {
    "hello world": function() {
      topology2();
    }
  }
});

suite.export(module);
