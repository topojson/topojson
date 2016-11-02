
//
// A-----B-----C-----D-----E
// |                       |
// |                       |
// J-----I-----H-----G-----F
tape("topology a polygon surrounding the South pole with a cut along the antimeridian", function(test) {
  var topology = topojson.topology({
    polygon: {type: "Polygon", coordinates: [[
      [-180, -80], [-90, -80], [0, -80], [90, -80], [180, -80],
      [180, -90], [90, -90], [0, -90], [-90, -90], [-180, -90],
      [-180, -80]
    ]]}}, 4);
  test.deepEqual(topology.arcs, [
    [[0, 3], [1, 0], [1, 0], [-2, 0]]
  ]);
  test.deepEqual(topology.objects.polygon, {type: "Polygon", arcs: [[0]]});
  test.end();
});

//
// B-----C-----D-----E-----F
// |                       |
// |                       |
// A                       G
// |                       |
// |                       |
// L-----K-----J-----I-----H
tape("topology a large polygon surrounding the South pole with a cut along the antimeridian", function(test) {
  var topology = topojson.topology({
    polygon: {type: "Polygon", coordinates: [[
      [-180, -85], [-180, -80], [-90, -80], [0, -80], [90, -80], [180, -80],
      [180, -85], [180, -90], [90, -90], [0, -90], [-90, -90], [-180, -90],
      [-180, -85]
    ]]}}, 5);
  test.deepEqual(topology.arcs, [
    [[0, 4], [1, 0], [1, 0], [1, 0], [-3, 0]]
  ]);
  test.deepEqual(topology.objects.polygon, {type: "Polygon", arcs: [[0]]});
  test.end();
});

//
// A-----B-----C-----D
// |                 |
// N                 E
//  \               /
//   M             F
//  /               \
// L                 G
// |                 |
// K-----J-----I-----H
tape("topology a large polygon with a hole across the antimeridian and cut along the antimeridian", function(test) {
  var topology = topojson.topology({
    polygon: {type: "Polygon", coordinates: [[
      [-180, -60], [-180, -30], [-150, 0], [-180, 30], [-180, 60], [-60, 60], [60, 60],
      [180, 60], [180, 30], [150, 0], [180, -30], [180, -60], [60, -60], [-60, -60], [-180, -60]
    ]]}}, 8);
  test.deepEqual(topology.arcs, [
    [[0, 7], [2, 0], [3, 0], [-5, 0]],
    [[0, 0], [5, 0], [-3, 0], [-2, 0]],
    [[0, 5], [6, -1], [-6, -2], [1, 2], [-1, 1]]
  ]);
  test.deepEqual(topology.objects.polygon, {type: "Polygon", arcs: [[0], [1], [2]]});
  test.end();
});
