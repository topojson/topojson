var tape = require("tape"),
    simplify = require("../lib/topojson/simplify");

tape("simplify removes points with area below minimum area threshold", function(test) {
  var topology = simplify({
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {},
    arcs: [
      [[0, 0], [10, 10], [0, 1], [1, -1], [-11, 0], [0, -10]]
    ]
  }, {
    "minimum-area": 2,
    "coordinate-system": "cartesian",
  });
  test.deepEqual(
    topology.arcs,
    [[[0, 0], [10, 10], [-10, 0], [0, -10]]]
  );
  test.end();
});

tape("simplify preserves points with area greater or equal to minimum area threshold", function(test) {
  var topology = simplify({
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {},
    arcs: [
      [[0, 0], [10, 10], [0, 1], [1, -1], [-11, 0], [0, -10]]
    ]
  }, {
    "minimum-area": 2,
    "coordinate-system": "cartesian",
  });
  test.deepEqual(
    topology.arcs,
    [[[0, 0], [10, 10], [-10, 0], [0, -10]]]
  );
  test.end();
});

tape("simplify assumes delta-encoded arcs for quantized topologies", function(test) {
  var topology = simplify({
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {},
    arcs: [
      [[0, 0], [10, 10], [0, 1], [1, -1], [-11, 0], [0, -10]]
    ]
  }, {
    "minimum-area": 2,
    "coordinate-system": "cartesian",
  });
  test.deepEqual(
    topology.arcs,
    [[[0, 0], [10, 10], [-10, 0], [0, -10]]]
  );
  test.end();
});

tape("simplify assumes non-delta-encoded arcs for non-quantized topologies", function(test) {
  var topology = simplify({
    objects: {},
    arcs: [
      [[0, 0], [10, 10], [10, 11], [11, 10], [0, 10], [0, 0]]
    ]
  }, {
    "minimum-area": 2,
    "coordinate-system": "cartesian",
  });
  test.deepEqual(
    topology.arcs,
    [[[0, 0], [10, 10], [0, 10], [0, 0]]]
  );
  test.end();
});

tape("simplify preserves degenerate arcs in non-quantized topologies", function(test) {
  var topology = simplify({
    objects: {},
    arcs: [
      [[50, 50], [50, 50]]
    ]
  }, {
    "minimum-area": 2,
    "coordinate-system": "cartesian"
  });
  test.deepEqual(topology.arcs, [
    [[50, 50], [50, 50]]
  ]);
  test.end();
});

tape("simplify preserves degenerate arcs in quantized topologies", function(test) {
  var topology = simplify({
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {},
    arcs: [
      [[50, 50], [0, 0]]
    ]
  }, {
    "minimum-area": 2,
    "coordinate-system": "cartesian"
  });
  test.deepEqual(topology.arcs, [
    [[50, 50], [0, 0]]
  ]);
  test.end();
});

tape("simplify does not remove empty arcs", function(test) {
  var topology = simplify({
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2]
      }
    },
    arcs: [
      [[0, 0], [10, 0]],
      [[10, 0], [1, 1], [-1, -1]],
      [[10, 0], [0, 10]]
    ]
  }, {
    "minimum-area": 1,
    "coordinate-system": "cartesian"
  });
  test.deepEqual(topology.arcs, [
    [[0, 0], [10, 0]],
    [[10, 0], [0, 0]],
    [[10, 0], [0, 10]]
  ]);
  test.deepEqual(topology.objects.foo.arcs, [0, 1, 2]);
  test.end();
});

tape("simplify minimum area is zero on empty input when retain-proportion is specified", function(test) {
  var options = {
    "retain-proportion": 1,
    "coordinate-system": "cartesian"
  };
  var topology = simplify({
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {},
    arcs: []
  }, options);
  test.equal(options["minimum-area"], 0);
  test.deepEqual(topology.arcs, []);
  test.end();
});
