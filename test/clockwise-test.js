var tape = require("tape"),
    clockwise = require("../lib/topojson/clockwise");

tape("clockwise spherical geometry ensures the ring with the largest absolute area is the exterior", function(test) {
  var o = {
    type: "Polygon",
    coordinates: [
      [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]],
      [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]]
    ]
  };
  clockwise(o, {"coordinate-system": "spherical"});
  test.deepEqual(o.coordinates, [
    [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]],
    [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]
  ]);
  test.end();
});

tape("clockwise spherical topology ensures the ring with the largest absolute area is the exterior", function(test) {
  var o = {
    type: "Topology",
    objects: {
      polygon: {
        type: "Polygon",
        arcs: [[0], [1]]
      }
    },
    arcs: [
      [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]],
      [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]]
    ]
  };
  clockwise(o, {"coordinate-system": "spherical"});
  test.deepEqual(o.objects.polygon.arcs, [[1], [0]]);
  test.end();
});

tape("clockwise cartesian geometry ensures the ring with the largest absolute area is the exterior", function(test) {
  var o = {
    type: "Polygon",
    coordinates: [
      [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
      [[0, 0], [3, 0], [3, 3], [0, 3], [0, 0]]
    ]
  };
  clockwise(o, {"coordinate-system": "cartesian"});
  test.deepEqual(o.coordinates, [
    [[0, 0], [3, 0], [3, 3], [0, 3], [0, 0]],
    [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]
  ]);
  test.end();
});

tape("clockwise cartesian topology ensures the ring with the largest absolute area is the exterior", function(test) {
  var o = {
    type: "Topology",
    objects: {
      polygon: {
        type: "Polygon",
        arcs: [[0], [1]]
      }
    },
    arcs: [
      [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
      [[0, 0], [3, 0], [3, 3], [0, 3], [0, 0]]
    ]
  };
  clockwise(o, {"coordinate-system": "cartesian"});
  test.deepEqual(o.objects.polygon.arcs, [[1], [0]]);
  test.end();
});
