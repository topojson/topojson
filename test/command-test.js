var fs = require("fs"),
    child = require("child_process"),
    vows = require("vows"),
    assert = require("./assert");

var suite = vows.describe("topojson");

suite.addBatch({
  "Empty geometries": testConversion("empty", "--allow-empty")
});

function testConversion(name, options) {
  return {
    topic: function() {
      var callback = this.callback;
      child.exec("./bin/topojson " + options + " -- ./test/inputs/" + name + "/*.json", function(error, stdout, stderr) {
        callback(null, JSON.parse(stdout));
      });
    },
    "has the expected output": function(actual) {
      var expected = JSON.parse(fs.readFileSync("./test/outputs/" + name + ".json", "utf-8"));
      assert.deepEqual(actual, expected);
    }
  };
}

suite.export(module);
