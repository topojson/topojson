var tape = require("tape"),
    delta = require("../lib/topojson/delta");

tape("delta converts arcs to delta encoding", function(test) {
  test.deepEqual(delta({
    type: "Topology",
    arcs: [
      [[0, 0], [9999, 0], [0, 9999], [0, 0]]
    ],
    objects: {}
  }).arcs, [
    [[0, 0], [9999, 0], [-9999, 9999], [0, -9999]]
  ]);
  test.end();
});

tape("delta does not skip coincident points", function(test) {
  test.deepEqual(delta({
    type: "Topology",
    arcs: [
      [[0, 0], [9999, 0], [9999, 0], [0, 9999], [0, 0]]
    ],
    objects: {}
  }).arcs, [
    [[0, 0], [9999, 0], [0, 0], [-9999, 9999], [0, -9999]]
  ]);
  test.end();
});

