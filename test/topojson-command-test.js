var fs = require("fs"),
    child = require("child_process"),
    tape = require("tape");

require("./inDelta");

testConversion(
  "Polygons",
  "polygon",
  "-- polygon=test/geojson/polygon-clockwise.json"
);

testConversion(
  "Polygons with --no-force-clockwise",
  "polygon-counterclockwise",
  "--no-force-clockwise"
  + " -- clockwise=test/geojson/polygon-clockwise.json"
  + " counterclockwise=test/geojson/polygon-counterclockwise.json"
);

testConversion(
  "Polygons with --projection",
  "polygon-mercator",
  "--projection 'd3.geo.mercator()'"
  + " --width 960"
  + " --height 500"
  + " --margin 20"
  + " -- clockwise=test/geojson/polygon-clockwise.json"
  + " counterclockwise=test/geojson/polygon-counterclockwise.json"
);

testConversion(
  "Polygons with --no-quantization",
  "polygon-no-quantization",
  "--no-quantization"
  + " -- polygon=test/geojson/polygon-clockwise.json"
);

testConversion(
  "Empty geometries",
  "empty",
  "-- multilinestring=test/geojson/empty-multilinestring.json"
  + " multipoint=test/geojson/empty-multipoint.json"
  + " multipolygon=test/geojson/empty-multipolygon.json"
  + " multipolygon2=test/geojson/empty-multipolygon2.json"
  + " polygon=test/geojson/empty-polygon.json"
);

testConversion(
  "Empty geometries with --allow-empty",
  "empty-allowed",
  "--allow-empty"
  + " -- multilinestring=test/geojson/empty-multilinestring.json"
  + " multipoint=test/geojson/empty-multipoint.json"
  + " multipolygon=test/geojson/empty-multipolygon.json"
  + " multipolygon2=test/geojson/empty-multipolygon2.json"
  + " polygon=test/geojson/empty-polygon.json"
);

testConversion(
  "Pass-through properties",
  "properties",
  "--no-quantization"
  + " --filter=none"
  + " --properties"
  + " -- properties=test/geojson/properties.json"
);

testConversion(
  "Computed property from coerced number",
  "properties-number",
  "--no-quantization"
  + " --filter=none"
  + " --properties=+boolean"
  + " -- properties=test/geojson/properties.json"
);

testConversion(
  "Computed property from expression",
  "properties-number",
  "--no-quantization"
  + " --filter=none"
  + " --properties='boolean=boolean?1:null'"
  + " -- properties=test/geojson/properties.json"
);

testConversion(
  "Computed id property from multiple candidates",
  "properties-id-fallback",
  "--no-quantization"
  + " --filter=none"
  + " --id-property=number,boolean,string"
  + " -- properties=test/geojson/properties.json"
);

testConversion(
  "Computed id property from expression",
  "properties-id-computed",
  "--no-quantization"
  + " --filter=none"
  + " --id-property='string.toUpperCase()'"
  + " -- properties=test/geojson/properties.json"
);

testConversion(
  "Join external properties with default id",
  "properties-external-default-id",
  "--no-quantization"
  + " --filter=none"
  + " --external-properties=test/tsv/properties-external.tsv"
  + " --properties=smörgåsbord=smörgåsbord"
  + " -- properties=test/geojson/no-properties.json"
);

function testConversion(name, output, options) {
  if (!options) options = "";
  tape(name, function(test) {
    child.exec("bin/topojson " + options + " | cat", function(error, stdout, stderr) {
      if (error) throw error;
      var actual = JSON.parse(stdout),
          expected = JSON.parse(fs.readFileSync("test/topojson/" + output + ".json", "utf-8"));
      test.inDelta(actual, expected);
      test.end();
    });
  });
}
