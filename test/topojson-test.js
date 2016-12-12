var tape = require("tape"),
    testExports = require("./test-exports");

for (var dependency in require("../package.json").dependencies) {
  testExports(dependency);
}
