var tape = require("tape"),
    spherical = require("../lib/topojson/spherical");

require("./inDelta");

tape("spherical.ringArea small clockwise area", function(test) {
  test.inDelta(spherical.ringArea([[0, -.5], [0, .5], [1, .5], [1, -.5], [0, -.5]]), 0.0003046212, 1e-10);
  test.end();
});

tape("spherical.ringArea small counterclockwise area", function(test) {
  test.inDelta(spherical.ringArea([[0, -.5], [1, -.5], [1, .5], [0, .5], [0, -.5]]), -0.0003046212, 1e-10);
  test.end();
});

tape("spherical.ringArea large clockwise rectangle", function(test) {
  test.inDelta(spherical.ringArea([[-170, 80], [0, 80], [170, 80], [170, -80], [0, -80], [-170, -80], [-170, 80]]), -0.7088456510, 1e-10);
  test.end();
});
