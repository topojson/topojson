var fs = require("fs"),
    child = require("child_process"),
    vows = require("vows"),
    assert = require("./assert");

var suite = vows.describe("bin/topojson");

suite.addBatch({
  "Polygons": testConversion(
    "polygon",
    "-- polygon=test/geojson/polygon-clockwise.json"
  ),

  "Polygons with --no-force-clockwise": testConversion(
    "polygon-counterclockwise",
    "--no-force-clockwise"
    + " -- clockwise=test/geojson/polygon-clockwise.json"
    + " counterclockwise=test/geojson/polygon-counterclockwise.json"
  ),

  "Polygons with --projection": testConversion(
    "polygon-mercator",
    "--projection 'd3.geo.mercator()'"
    + " --width 960"
    + " --height 500"
    + " --margin 20"
    + " -- clockwise=test/geojson/polygon-clockwise.json"
    + " counterclockwise=test/geojson/polygon-counterclockwise.json"
  ),

  "Polygons with --no-quantization": testConversion(
    "polygon-no-quantization",
    "--no-quantization"
    + " -- polygon=test/geojson/polygon-clockwise.json"
  ),

  "Empty geometries": testConversion(
    "empty",
    "-- multilinestring=test/geojson/empty-multilinestring.json"
    + " multipoint=test/geojson/empty-multipoint.json"
    + " multipolygon=test/geojson/empty-multipolygon.json"
    + " multipolygon2=test/geojson/empty-multipolygon2.json"
    + " polygon=test/geojson/empty-polygon.json"
  ),

  "Empty geometries with --allow-empty": testConversion(
    "empty-allowed",
    "--allow-empty"
    + " -- multilinestring=test/geojson/empty-multilinestring.json"
    + " multipoint=test/geojson/empty-multipoint.json"
    + " multipolygon=test/geojson/empty-multipolygon.json"
    + " multipolygon2=test/geojson/empty-multipolygon2.json"
    + " polygon=test/geojson/empty-polygon.json"
  ),

  "Pass-through properties": testConversion(
    "properties",
    "--no-quantization"
    + " --filter=none"
    + " --properties"
    + " -- properties=test/geojson/properties.json"
  ),

  "Computed property from coerced number": testConversion(
    "properties-number",
    "--no-quantization"
    + " --filter=none"
    + " --properties=+boolean"
    + " -- properties=test/geojson/properties.json"
  ),

  "Computed property from expression": testConversion(
    "properties-number",
    "--no-quantization"
    + " --filter=none"
    + " --properties='boolean=boolean?1:null'"
    + " -- properties=test/geojson/properties.json"
  ),

  "Computed id property from multiple candidates": testConversion(
    "properties-id-fallback",
    "--no-quantization"
    + " --filter=none"
    + " --id-property=number,boolean,string"
    + " -- properties=test/geojson/properties.json"
  ),

  "Computed id property from expression": testConversion(
    "properties-id-computed",
    "--no-quantization"
    + " --filter=none"
    + " --id-property='string.toUpperCase()'"
    + " -- properties=test/geojson/properties.json"
  ),

  "Join external properties with default id": testConversion(
    "properties-external-default-id",
    "--no-quantization"
    + " --filter=none"
    + " --external-properties=test/tsv/properties-external.tsv"
    + " --properties=smörgåsbord=smörgåsbord"
    + " -- properties=test/geojson/no-properties.json"
  )
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
      var expected = JSON.parse(fs.readFileSync("test/topojson/" + output + ".json", "utf-8"));
      assert.inDelta(actual, expected);
    }
  };
}

suite.export(module);
