var tape = require("tape"),
    index = require("../../lib/topojson/topology/index");

tape("topology exact duplicate lines ABC & ABC share the arc ABC", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("topology reversed duplicate lines ABC & CBA share the arc ABC", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [~0]
      }
    }
  });
  test.end();
});

tape("topology when an old arc ABC extends a new arc AB, they share the arc AB", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("topology when a reversed old arc CBA extends a new arc AB, they share the arc BA", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[2, 0], [1, 0]],
      [[1, 0], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [~1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ADE shares its start with an old arc ABC, they don’t share arcs", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 1], [2, 1]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [2, 0]],
      [[0, 0], [1, 1], [2, 1]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc DEC shares its start with an old arc ABC, they don’t share arcs", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 1], [1, 1], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABC extends an old arc AB, they share the arc AB", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [0, 1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABC extends a reversed old arc BA, they share the arc BA", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[1, 0], [0, 0]],
      [[1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [~0, 1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc starts BC in the middle of an old arc ABC, they share the arc BC", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc BC starts in the middle of a reversed old arc CBA, they share the arc CB", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[2, 0], [1, 0]],
      [[1, 0], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [~0]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABD deviates from an old arc ABC, they share the arc AB", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [3, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]],
      [[1, 0], [3, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [0, 2]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABD deviates from a reversed old arc CBA, they share the arc BA", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [3, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[2, 0], [1, 0]],
      [[1, 0], [0, 0]],
      [[1, 0], [3, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [~1, 2]
      }
    }
  });
  test.end();
});

tape("topology when a new arc DBC merges into an old arc ABC, they share the arc BC", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[3, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]],
      [[3, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [2, 1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc DBC merges into a reversed old arc CBA, they share the arc CB", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[3, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[2, 0], [1, 0]],
      [[1, 0], [0, 0]],
      [[3, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [2, ~0]
      }
    }
  });
  test.end();
});

tape("topology when a new arc DBE shares a single midpoint with an old arc ABC, they share the point B, but no arcs", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 1], [1, 0], [2, 1]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]],
      [[0, 1], [1, 0]],
      [[1, 0], [2, 1]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [2, 3]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABDE skips a point with an old arc ABCDE, they share arcs AB and DE", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0], [3, 0]],
      [[3, 0], [4, 0]],
      [[1, 0], [3, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2]
      },
      bar: {
        type: "LineString",
        arcs: [0, 3, 2]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABDE skips a point with a reversed old arc EDCBA, they share arcs BA and ED", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[4, 0], [3, 0]],
      [[3, 0], [2, 0], [1, 0]],
      [[1, 0], [0, 0]],
      [[1, 0], [3, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2]
      },
      bar: {
        type: "LineString",
        arcs: [~2, 3, ~0]
      }
    }
  });
  test.end();
});

tape("topology when an arc ABCDBE self-intersects, it is still one arc", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]
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

tape("topology when an old arc ABCDBE self-intersects and shares a point B, the old arc has multiple cuts", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 1], [1, 0], [2, 1]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0], [3, 0], [1, 0]],
      [[1, 0], [4, 0]],
      [[0, 1], [1, 0]],
      [[1, 0], [2, 1]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2]
      },
      bar: {
        type: "LineString",
        arcs: [3, 4]
      }
    }
  });
  test.end();
});

tape("topology when an arc ABCA is closed, it has one arc", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
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

tape("topology exact duplicate closed lines ABCA & ABCA share the arc ABCA", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("topology reversed duplicate closed lines ABCA & ACBA share the arc ABCA", function(test) {
  var topology = index({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [0, 1], [1, 0], [0, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [~0]
      }
    }
  });
  test.end();
});

tape("topology coincident closed polygons ABCA & BCAB share the arc BCAB", function(test) {
  var topology = index({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    bcab: {type: "Polygon", coordinates: [[[1, 0], [0, 1], [0, 0], [1, 0]]]}
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      abca: {type: "Polygon", arcs: [[0]]},
      bcab: {type: "Polygon", arcs: [[0]]}
    }
  });
  test.end();
});

tape("topology coincident reversed closed polygons ABCA & BACB share the arc BCAB", function(test) {
  var topology = index({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    bacb: {type: "Polygon", coordinates: [[[1, 0], [0, 0], [0, 1], [1, 0]]]}
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      abca: {type: "Polygon", arcs: [[0]]},
      bacb: {type: "Polygon", arcs: [[~0]]}
    }
  });
  test.end();
});

tape("topology coincident closed polygons ABCA & DBED share the point B", function(test) {
  var topology = index({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    dbed: {type: "Polygon", coordinates: [[[2, 1], [1, 0], [2, 2], [2, 1]]]}
  });
  test.deepEqual(topology, {
    type: "Topology",
    arcs: [
      [[1, 0], [0, 1], [0, 0], [1, 0]],
      [[1, 0], [2, 2], [2, 1], [1, 0]]
    ],
    objects: {
      abca: {
        type: "Polygon",
        arcs: [[0]]
      },
      dbed: {
        type: "Polygon",
        arcs: [[1]]
      }
    }
  });
  test.end();
});
