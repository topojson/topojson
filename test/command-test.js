var fs = require("fs"),
    child = require("child_process"),
    vows = require("vows"),
    assert = require("./assert");

var suite = vows.describe("topojson");

suite.addBatch({
  "Empty geometries": testConversion("empty", "empty"),
  "Empty geometries with --allow-empty": testConversion("empty", "empty-allowed", "--allow-empty")
});

function testConversion(input, output, options) {
  if (!options) options = "";
  return {
    topic: function() {
      var callback = this.callback;
      child.exec("./bin/topojson " + options + " -- ./test/inputs/" + input + "/*.json", function(error, stdout, stderr) {
        callback(error, error ? null : JSON.parse(stdout));
      });
    },
    "has the expected output": function(actual) {
      var expected = JSON.parse(fs.readFileSync("./test/outputs/" + output + ".json", "utf-8"));
      assert.deepEqual(actual, expected);
    }
  };
}

suite.export(module);
