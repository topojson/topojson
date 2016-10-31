var tape = require("tape"),
    bounds = require("../lib/topojson/bounds");

tape("bounds computes the bounding box", function(test) {
  test.deepEqual(bounds({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 2], [0, 0]]
    }
  }), [0, 0, 1, 2]);
  test.end();
});

tape("bounds considers points as well as arcs", function(test) {
  test.deepEqual(bounds({
    foo: {
      type: "MultiPoint",
      coordinates: [[0, 0], [1, 0], [0, 2], [0, 0]]
    }
  }), [0, 0, 1, 2]);
  test.end();
});
