var fs = require("fs"),
    os = require("os"),
    path = require("path"),
    child = require("child_process"),
    tape = require("tape");

require("./inDelta");

var tmpprefix = "geojson-command-test-" + process.pid + "-",
    testId = Math.random() * 0xffff | 0;

testConversion(
  "Polygons",
  {
    polygon: "polygon-feature"
  },
  "-- test/topojson/polygon.json"
);

testConversion(
  "Non-quantized Polygons",
  {
    polygon: "polygon-feature"
  },
  "-- test/topojson/polygon-no-quantization.json"
);

testConversion(
  "Projected polygons",
  {
    clockwise: "polygon-feature-mercator",
    counterclockwise: "polygon-feature-mercator"
  },
  "-- test/topojson/polygon-mercator.json"
);

testConversion(
  "Rounded polygons",
  {
    clockwise: "polygon-feature-rounded",
    counterclockwise: "polygon-feature-rounded"
  },
  "--precision 2"
  + " -- test/topojson/polygon-mercator.json"
);

function testConversion(name, output, options) {
  if (!options) options = "";
  var tmpdir = path.join(os.tmpdir(), tmpprefix + (++testId).toString(16));
  fs.mkdirSync(tmpdir);
  tape(name, function(test) {
    child.exec("bin/topojson-geojson -o " + tmpdir + " " + options, function(error) {
      if (error) throw error;
      var actual = {};
      fs.readdirSync(tmpdir).forEach(function(file) {
        actual[path.basename(file, ".json")] = JSON.parse(fs.readFileSync(tmpdir + "/" + file), "utf-8");
        fs.unlinkSync(tmpdir + "/" + file);
      });
      fs.rmdir(tmpdir);
      for (var file in output) {
        test.inDelta(actual[file], JSON.parse(fs.readFileSync("test/geojson/" + output[file] + ".json", "utf-8")));
      }
      test.end();
    });
  });
}
