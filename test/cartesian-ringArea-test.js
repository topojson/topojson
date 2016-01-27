var tape = require("tape"),
    cartesian = require("../lib/topojson/cartesian");

tape("cartesian.ringArea clockwise area is positive", function(test) {
  test.ok(cartesian.ringArea([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]) > 0);
  test.end();
});

tape("cartesian.ringArea counterclockwise area is negative", function(test) {
  test.ok(cartesian.ringArea([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]) < 0);
  test.end();
});
