var tape = require("tape"),
    extract = require("../../lib/topojson/topology/extract");

tape("extract copies coordinates sequentially into a buffer", function(test) {
  var topology = extract({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology.coordinates, [[0, 0], [1, 0], [2, 0], [0, 0], [1, 0], [2, 0]]);
  test.end();
});

tape("extract does not copy point geometries into the coordinate buffer", function(test) {
  var topology = extract({
    foo: {
      type: "Point",
      coordinates: [0, 0]
    },
    bar: {
      type: "MultiPoint",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology.coordinates, []);
  test.deepEqual(topology.objects.foo.coordinates, [0, 0]);
  test.deepEqual(topology.objects.bar.coordinates, [[0, 0], [1, 0], [2, 0]]);
  test.end();
});

tape("extract includes closing coordinates in polygons", function(test) {
  var topology = extract({
    foo: {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
    }
  });
  test.deepEqual(topology.coordinates, [[0, 0], [1, 0], [2, 0], [0, 0]]);
  test.end();
});

tape("extract represents lines as contiguous slices of the coordinate buffer", function(test) {
  var topology = extract({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology.objects, {
    foo: {
      type: "LineString",
      arcs: [0, 2]
    },
    bar: {
      type: "LineString",
      arcs: [3, 5]
    }
  });
  test.end();
});

tape("extract represents rings as contiguous slices of the coordinate buffer", function(test) {
  var topology = extract({
    foo: {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
    },
    bar: {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
    }
  });
  test.deepEqual(topology.objects, {
    foo: {
      type: "Polygon",
      arcs: [[0, 3]]
    },
    bar: {
      type: "Polygon",
      arcs: [[4, 7]]
    }
  });
  test.end();
});

tape("extract exposes the constructed lines and rings in the order of construction", function(test) {
  var topology = extract({
    line: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    multiline: {
      type: "MultiLineString",
      coordinates: [[[0, 0], [1, 0], [2, 0]]]
    },
    polygon: {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
    }
  });
  test.deepEqual(topology.lines, [
    [0, 2],
    [3, 5]
  ]);
  test.deepEqual(topology.rings, [
    [6, 9]
  ]);
  test.end();
});

tape("extract supports nested geometry collections", function(test) {
  var topology = extract({
    foo: {
      type: "GeometryCollection",
      geometries: [{
        type: "GeometryCollection",
        geometries: [{
          type: "LineString",
          coordinates: [[0, 0], [0, 1]]
        }]
      }]
    }
  });
  test.deepEqual(topology.objects.foo, {
    type: "GeometryCollection",
    geometries: [{
      type: "GeometryCollection",
      geometries: [{
        type: "LineString",
        arcs: [0, 1]
      }]
    }]
  });
  test.end();
});
