var tape = require("tape"),
    topojson = require("../");

module.exports = function(moduleName) {
  var module = require(moduleName);
  tape("topojson exports everything from " + moduleName, function(test) {
    for (var symbol in module) {
      if (symbol !== "version") {
        test.equal(symbol in topojson, true, moduleName + " export " + symbol);
      }
    }
    test.end();
  });
};
