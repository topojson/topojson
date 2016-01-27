var tape = require("tape"),
    prune = require("../lib/topojson/prune");

tape("prune preserves arcs that are referenced", function(test) {
  test.deepEqual(prune({
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      }
    }
  }), {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("prune removes arcs that are not referenced", function(test) {
  test.deepEqual(prune({
    type: "Topology",
    arcs: [
      [[0, 0], [2, 0]],
      [[1, 0], [1, 0]],
      [[2, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 2]
      }
    }
  }), {
    type: "Topology",
    arcs: [
      [[0, 0], [2, 0]],
      [[2, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      }
    }
  });
  test.end();
});

tape("prune removes reversed arcs that are not referenced", function(test) {
  test.deepEqual(prune({
    type: "Topology",
    arcs: [
      [[0, 0], [2, 0]],
      [[1, 0], [1, 0]],
      [[2, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [~2, ~0]
      }
    }
  }), {
    type: "Topology",
    arcs: [
      [[2, 0], [1, 0]],
      [[0, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [~0, ~1]
      }
    }
  });
  test.end();
});

tape("prune does not remove collapsed arcs", function(test) {
  test.deepEqual(prune({
    type: "Topology",
    arcs: [
      [[0, 0], [0, 0]],
      [[0, 0], [2, 0]],
      [[2, 0], [0, 0]],
      [[2, 0], [1, 0]],
      [[3, 0], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2, 3, 4]
      }
    }
  }), {
    type: "Topology",
    arcs: [
      [[0, 0], [0, 0]],
      [[0, 0], [2, 0]],
      [[2, 0], [0, 0]],
      [[2, 0], [1, 0]],
      [[3, 0], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2, 3, 4]
      }
    }
  });
  test.end();
});

tape("prune does not remove collapsed lines", function(test) {
  test.deepEqual(prune({
    type: "Topology",
    arcs: [
      [[2, 0], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      }
    }
  }), {
    type: "Topology",
    arcs: [
      [[2, 0], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});
