var tape = require("tape"),
    topojson = require("../");

//
// +----+----+            +----+----+
// |    |    |            |         |
// |    |    |    ==>     |         |
// |    |    |            |         |
// +----+----+            +----+----+
//
tape("merge stitches together two side-by-side polygons", function(test) {
  var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]}},
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[1, 0], [1, 1], [2, 1], [2, 0], [1, 0]]]}}
  ]}}, {
    quantization: 0
  });
  test.deepEqual(topojson.merge(topology, topology.objects.collection.geometries), {
    type: "MultiPolygon",
    coordinates: [[[[1, 0], [0, 0], [0, 1], [1, 1], [2, 1], [2, 0], [1, 0]]]]
  });
  test.end();
});

//
// +----+ +----+            +----+ +----+
// |    | |    |            |    | |    |
// |    | |    |    ==>     |    | |    |
// |    | |    |            |    | |    |
// +----+ +----+            +----+ +----+
//
tape("merge does not stitch together two separated polygons", function(test) {
  var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]}},
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[2, 0], [2, 1], [3, 1], [3, 0], [2, 0]]]}}
  ]}}, {
    quantization: 0
  });
  test.deepEqual(topojson.merge(topology, topology.objects.collection.geometries), {
    type: "MultiPolygon",
    coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]], [[[2, 0], [2, 1], [3, 1], [3, 0], [2, 0]]]]
  });
  test.end();
});

//
// +-----------+            +-----------+
// |           |            |           |
// |   +---+   |    ==>     |   +---+   |
// |   |   |   |            |   |   |   |
// |   +---+   |            |   +---+   |
// |           |            |           |
// +-----------+            +-----------+
//
tape("merge does not stitch together a polygon and its hole", function(test) {
  var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]], [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]}}
  ]}}, {
    quantization: 0
  });
  test.deepEqual(topojson.merge(topology, topology.objects.collection.geometries), {
    type: "MultiPolygon",
    coordinates: [[[[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]], [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]]
  });
  test.end();
});

//
// +-----------+            +-----------+
// |           |            |           |
// |   +---+   |    ==>     |           |
// |   |   |   |            |           |
// |   +---+   |            |           |
// |           |            |           |
// +-----------+            +-----------+
//
tape("merge stitches together a polygon surrounding another polygon", function(test) {
  var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]], [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]}},
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]}}
  ]}}, {
    quantization: 0
  });
  test.deepEqual(topojson.merge(topology, topology.objects.collection.geometries), {
    type: "MultiPolygon",
    coordinates: [[[[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]]]]
  });
  test.end();
});

//
// +-----------+-----------+            +-----------+-----------+
// |           |           |            |                       |
// |   +---+   |   +---+   |    ==>     |   +---+       +---+   |
// |   |   |   |   |   |   |            |   |   |       |   |   |
// |   +---+   |   +---+   |            |   +---+       +---+   |
// |           |           |            |                       |
// +-----------+-----------+            +-----------+-----------+
//
tape("merge stitches together two side-by-side polygons with holes", function(test) {
  var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]], [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]}},
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[3, 0], [3, 3], [6, 3], [6, 0], [3, 0]], [[4, 1], [5, 1], [5, 2], [4, 2], [4, 1]]]}}
  ]}}, {
    quantization: 0
  });
  test.deepEqual(topojson.merge(topology, topology.objects.collection.geometries), {
    type: "MultiPolygon",
    coordinates: [[[[3, 0], [0, 0], [0, 3], [3, 3], [6, 3], [6, 0], [3, 0]], [[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]], [[4, 1], [5, 1], [5, 2], [4, 2], [4, 1]]]]
  });
  test.end();
});

//
// +-------+-------+            +-------+-------+
// |       |       |            |               |
// |   +---+---+   |    ==>     |   +---+---+   |
// |   |       |   |            |   |       |   |
// |   +---+---+   |            |   +---+---+   |
// |       |       |            |               |
// +-------+-------+            +-------+-------+
//
tape("merge stitches together two horseshoe polygons, creating a hole", function(test) {
  var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 3], [2, 3], [2, 2], [1, 2], [1, 1], [2, 1], [2, 0], [0, 0]]]}},
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [4, 3], [4, 0], [2, 0]]]}}
  ]}}, {
    quantization: 0
  });
  test.deepEqual(topojson.merge(topology, topology.objects.collection.geometries), {
    type: "MultiPolygon",
    coordinates: [[[[2, 0], [0, 0], [0, 3], [2, 3], [4, 3], [4, 0], [2, 0]], [[2, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 2], [2, 2]]]]
  });
  test.end();
});

//
// +-------+-------+            +-------+-------+
// |       |       |            |               |
// |   +---+---+   |    ==>     |               |
// |   |   |   |   |            |               |
// |   +---+---+   |            |               |
// |       |       |            |               |
// +-------+-------+            +-------+-------+
//
tape("merge stitches together two horseshoe polygons surrounding two other polygons", function(test) {
  var topology = topojson.topology({collection: {type: "FeatureCollection", features: [
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 3], [2, 3], [2, 2], [1, 2], [1, 1], [2, 1], [2, 0], [0, 0]]]}},
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [4, 3], [4, 0], [2, 0]]]}},
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]}},
    {type: "Feature", geometry: {type: "Polygon", coordinates: [[[2, 1], [2, 2], [3, 2], [3, 1], [2, 1]]]}}
  ]}}, {
    quantization: 0
  });
  test.deepEqual(topojson.merge(topology, topology.objects.collection.geometries), {
    type: "MultiPolygon",
    coordinates: [[[[2, 0], [0, 0], [0, 3], [2, 3], [4, 3], [4, 0], [2, 0]]]]
  });
  test.end();
});
