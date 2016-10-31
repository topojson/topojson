var fs = require("fs"),
    child = require("child_process"),
    tape = require("tape");

require("./inDelta");

testConversion(
  "Polygons",
  "test/topojson/polygon-no-quantization.json",
  "polygon=test/geojson/polygon-clockwise.json"
);

testConversion(
  "Quantized polygons",
  "test/topojson/polygon.json",
  "-q 1e4 polygon=test/geojson/polygon-clockwise.json"
);

testConversion(
  "Empty geometries",
  "test/topojson/empty.json",
  "-- multilinestring=test/geojson/empty-multilinestring.json"
  + " multipoint=test/geojson/empty-multipoint.json"
  + " multipolygon=test/geojson/empty-multipolygon.json"
  + " multipolygon2=test/geojson/empty-multipolygon2.json"
  + " polygon=test/geojson/empty-polygon.json"
);

function testConversion(name, output, options) {
  if (!options) options = "";
  tape(name, function(test) {
    child.exec("bin/geo2topo " + options, function(error, stdout, stderr) {
      if (error) throw error;
      var actual = JSON.parse(stdout),
          expected = JSON.parse(fs.readFileSync(output, "utf-8"));
      test.inDelta(actual, expected);
      test.end();
    });
  });
}
