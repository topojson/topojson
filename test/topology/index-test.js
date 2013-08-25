var vows = require("vows"),
    assert = require("assert"),
    index = require("../../lib/topojson/topology/index");

var suite = vows.describe("topology");

suite.addBatch({
  "topology": {
    "exact duplicate lines ABC & ABC share the arc ABC": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [0]
          }
        }
      });
    },
    "reversed duplicate lines ABC & CBA share the arc ABC": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [~0]
          }
        }
      });
    },
    "when an old arc ABC extends a new arc AB, they share the arc AB": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0]],
          [[1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [0]
          }
        }
      });
    },
    "when a reversed old arc CBA extends a new arc AB, they share the arc BA": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[2, 0], [1, 0]],
          [[1, 0], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [~1]
          }
        }
      });
    },
    "when a new arc ADE shares its start with an old arc ABC, they don’t share arcs": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]],
          [[0, 0], [1, 1], [2, 1]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [1]
          }
        }
      });
    },
    "when a new arc DEC shares its start with an old arc ABC, they don’t share arcs": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]],
          [[0, 1], [1, 1], [2, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [1]
          }
        }
      });
    },
    "when a new arc ABC extends an old arc AB, they share the arc AB": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0]],
          [[1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [0, 1]
          }
        }
      });
    },
    "when a new arc ABC extends a reversed old arc BA, they share the arc BA": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[1, 0], [0, 0]],
          [[1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [~0, 1]
          }
        }
      });
    },
    "when a new arc starts BC in the middle of an old arc ABC, they share the arc BC": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0]],
          [[1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [1]
          }
        }
      });
    },
    "when a new arc BC starts in the middle of a reversed old arc CBA, they share the arc CB": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[2, 0], [1, 0]],
          [[1, 0], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [~0]
          }
        }
      });
    },
    "when a new arc ABD deviates from an old arc ABC, they share the arc AB": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0]],
          [[1, 0], [2, 0]],
          [[1, 0], [3, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [0, 2]
          }
        }
      });
    },
    "when a new arc ABD deviates from a reversed old arc CBA, they share the arc BA": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[2, 0], [1, 0]],
          [[1, 0], [0, 0]],
          [[1, 0], [3, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [~1, 2]
          }
        }
      });
    },
    "when a new arc DBC merges into an old arc ABC, they share the arc BC": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0]],
          [[1, 0], [2, 0]],
          [[3, 0], [1, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [2, 1]
          }
        }
      });
    },
    "when a new arc DBC merges into a reversed old arc CBA, they share the arc CB": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[2, 0], [1, 0]],
          [[1, 0], [0, 0]],
          [[3, 0], [1, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [2, ~0]
          }
        }
      });
    },
    "when a new arc DBE shares a single midpoint with an old arc ABC, they share the point B, but no arcs": function() {
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
      assert.deepEqual(topology, {
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
            coordinates: [0, 1]
          },
          bar: {
            type: "LineString",
            coordinates: [2, 3]
          }
        }
      });
    },
    "when a new arc ABDE skips a point with an old arc ABCDE, they share arcs AB and DE": function() {
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
      assert.deepEqual(topology, {
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
            coordinates: [0, 1, 2]
          },
          bar: {
            type: "LineString",
            coordinates: [0, 3, 2]
          }
        }
      });
    },
    "when a new arc ABDE skips a point with a reversed old arc EDCBA, they share arcs BA and ED": function() {
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
      assert.deepEqual(topology, {
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
            coordinates: [0, 1, 2]
          },
          bar: {
            type: "LineString",
            coordinates: [~2, 3, ~0]
          }
        }
      });
    },
    "when an arc ABCDBE self-intersects, it still only has one arc": function() {
      var topology = index({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]
        }
      });
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          }
        }
      });
    },
    "when an old arc ABCDBE self-intersects and shares a point B, the old arc has multiple cuts": function() {
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
      assert.deepEqual(topology, {
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
            coordinates: [0, 1, 2]
          },
          bar: {
            type: "LineString",
            coordinates: [3, 4]
          }
        }
      });
    },
    "when an arc ABCA is closed, it has one arc": function() {
      var topology = index({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
        }
      });
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [0, 1], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          }
        }
      });
    },
    "exact duplicate closed lines ABCA & ABCA share the arc ABCA": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [0, 1], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [0]
          }
        }
      });
    },
    "reversed duplicate closed lines ABCA & ACBA share the arc ABCA": function() {
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
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [0, 1], [0, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [~0]
          }
        }
      });
    },
    "coincident closed lines ABCA & BCAB share the arc BCAB": function() {
      var topology = index({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]] // is rotated left by 1
        },
        bar: {
          type: "LineString",
          coordinates: [[1, 0], [0, 1], [0, 0], [1, 0]]
        }
      });
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[1, 0], [0, 1], [0, 0], [1, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [0]
          }
        }
      });
    },
    "coincident closed lines ABCA & BACB share the arc BCAB": function() {
      var topology = index({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]] // is rotated left by 1
        },
        bar: {
          type: "LineString",
          coordinates: [[1, 0], [0, 0], [0, 1], [1, 0]]
        }
      });
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[1, 0], [0, 1], [0, 0], [1, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [~0]
          }
        }
      });
    },
    "coincident closed lines ABCA & DBE share the point B": function() {
      var topology = index({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]] // is rotated left by 1
        },
        bar: {
          type: "LineString",
          coordinates: [[2, 1], [1, 0], [2, 2]]
        }
      });
      assert.deepEqual(topology, {
        type: "Topology",
        arcs: [
          [[1, 0], [0, 1], [0, 0], [1, 0]],
          [[2, 1], [1, 0]],
          [[1, 0], [2, 2]]
        ],
        objects: {
          foo: {
            type: "LineString",
            coordinates: [0]
          },
          bar: {
            type: "LineString",
            coordinates: [1, 2]
          }
        }
      });
    }
  }
});

suite.export(module);
