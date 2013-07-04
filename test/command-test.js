var fs = require("fs"),
    child = require("child_process"),
    vows = require("vows"),
    assert = require("./assert");

var suite = vows.describe("topojson");

suite.addBatch({
  "Polygons": testConversion(
    "polygon",
    "-- polygon=test/inputs/polygon-clockwise.json"
  ),

  "Polygons with --no-force-clockwise": testConversion(
    "polygon-counterclockwise",
    "--no-force-clockwise"
    + " -- clockwise=test/inputs/polygon-clockwise.json"
    + " counterclockwise=test/inputs/polygon-counterclockwise.json"
  ),

  "Polygons with --projection": testConversion(
    "polygon-mercator",
    "--projection 'd3.geo.mercator()'"
    + " --width 960"
    + " --height 500"
    + " --margin 20"
    + " -- polygon=test/inputs/polygon-clockwise.json"
  ),

  "Empty geometries": testConversion(
    "empty",
    "-- multilinestring=test/inputs/empty-multilinestring.json"
    + " multipoint=test/inputs/empty-multipoint.json"
    + " multipolygon=test/inputs/empty-multipolygon.json"
    + " multipolygon2=test/inputs/empty-multipolygon2.json"
    + " polygon=test/inputs/empty-polygon.json"
  ),

  "Empty geometries with --allow-empty": testConversion(
    "empty-allowed",
    "--allow-empty"
    + " -- multilinestring=test/inputs/empty-multilinestring.json"
    + " multipoint=test/inputs/empty-multipoint.json"
    + " multipolygon=test/inputs/empty-multipolygon.json"
    + " multipolygon2=test/inputs/empty-multipolygon2.json"
    + " polygon=test/inputs/empty-polygon.json"
  ),
});

function testConversion(output, options) {
  if (!options) options = "";
  return {
    topic: function() {
      var callback = this.callback;
      child.exec("bin/topojson " + options, function(error, stdout, stderr) {
        callback(error, error ? null : JSON.parse(stdout));
      });
    },
    "has the expected output": function(actual) {
      var expected = JSON.parse(fs.readFileSync("test/outputs/" + output + ".json", "utf-8"));
      assert.deepEqual(actual, expected);
    }
  };
}

suite.export(module);
