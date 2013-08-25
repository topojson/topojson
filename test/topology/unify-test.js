var vows = require("vows"),
    assert = require("assert"),
    arcify = require("../../lib/topojson/topology/arcify"),
    unify = require("../../lib/topojson/topology/unify");

var suite = vows.describe("unify");

suite.addBatch({
  "unify": {
    "exact duplicate lines ABC & ABC share the arc ABC": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      }));
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 2, next: null});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 0, end: 2, next: null});
    },
    "reversed duplicate lines ABC & CBA share the arc ABC": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[2, 0], [1, 0], [0, 0]]
        }
      }));
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 2, next: null});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 2, end: 0, next: null});
    },
    "when an old arc ABC extends a new arc AB, they share the arc AB": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0]]
        }
      }));
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 1, next: {start: 1, end: 2, next: null}});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 0, end: 1, next: null});
    },
    "when a reversed old arc CBA extends a new arc AB, they share the arc AB": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[2, 0], [1, 0], [0, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [2, 0, 1, 0, 0, 0, 0, 0, 1, 0]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 1, next: {start: 1, end: 2, next: null}});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 2, end: 1, next: null});
    },
    "when a new arc ADE shares its start with an old arc ABC, they don’t share arcs": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 1], [2, 1]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [0, 0, 1, 0, 2, 0, 0, 0, 1, 1, 2, 1]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 2, next: null});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 3, end: 5, next: null});
    },
    "when a new arc DEC shares its start with an old arc ABC, they don’t share arcs": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 1], [1, 1], [2, 0]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 0]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 2, next: null});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 3, end: 5, next: null});
    },
    "when a new arc ABC extends an old arc AB, they share the arc AB": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [0, 0, 1, 0, 0, 0, 1, 0, 2, 0]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 1, next: null});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 0, end: 1, next: {start: 3, end: 4, next: null}});
    },
    "when a new arc ABC extends a reversed old arc BA, they share the arc BA": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[1, 0], [0, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [1, 0, 0, 0, 0, 0, 1, 0, 2, 0]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 1, next: null});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 1, end: 0, next: {start: 3, end: 4, next: null}});
    },
    "when a new arc starts BC in the middle of an old arc ABC, they share the arc BC": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[1, 0], [2, 0]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [0, 0, 1, 0, 2, 0, 1, 0, 2, 0]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 1, next: {start: 1, end: 2, next: null}});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 1, end: 2, next: null});
    },
    "when a new arc BC starts in the middle of a reversed old arc CBA, they share the arc CB": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[2, 0], [1, 0], [0, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[1, 0], [2, 0]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [2, 0, 1, 0, 0, 0, 1, 0, 2, 0]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 1, next: {start: 1, end: 2, next: null}});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 1, end: 0, next: null});
    },
    "when a new arc ABD deviates from an old arc ABC, they share the arc AB": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [3, 0]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [0, 0, 1, 0, 2, 0, 0, 0, 1, 0, 3, 0]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 1, next: {start: 1, end: 2, next: null}});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 0, end: 1, next: {start: 4, end: 5, next: null}});
    },
    "when a new arc ABD deviates from a reversed old arc CBA, they share the arc BA": function() {
      var topology = unify(arcify({
        foo: {
          type: "LineString",
          coordinates: [[2, 0], [1, 0], [0, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [3, 0]]
        }
      }));
      assert.deepEqual(Array.apply([], topology.coordinates), [2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 3, 0]);
      assert.deepEqual(topology.objects.foo.coordinates, {start: 0, end: 1, next: {start: 1, end: 2, next: null}});
      assert.deepEqual(topology.objects.bar.coordinates, {start: 2, end: 1, next: {start: 4, end: 5, next: null}});
    },
    "not yet implemented: when a new arc DBC merges into an old arc ABC": function() {
      assert.throws(function() {
        var topology = unify(arcify({
          foo: {
            type: "LineString",
            coordinates: [[0, 0], [1, 0], [2, 0]]
          },
          bar: {
            type: "LineString",
            coordinates: [[3, 0], [1, 0], [2, 0]]
          }
        }));
      }, Error);
    },
    "not yet implemented: when a new arc DBC merges into a reversed old arc CBA": function() {
      assert.throws(function() {
        var topology = unify(arcify({
          foo: {
            type: "LineString",
            coordinates: [[2, 0], [1, 0], [0, 0]]
          },
          bar: {
            type: "LineString",
            coordinates: [[3, 0], [1, 0], [2, 0]]
          }
        }));
      }, Error);
    },
    "not yet implemented: when a new arc DBE shares a single midpoint with an old arc ABC": function() {
      assert.throws(function() {
        var topology = unify(arcify({
          foo: {
            type: "LineString",
            coordinates: [[0, 0], [1, 0], [2, 0]]
          },
          bar: {
            type: "LineString",
            coordinates: [[0, 1], [1, 0], [2, 1]]
          }
        }));
      }, Error);
    },
    "not yet implemented: when a new arc skips a point with an old arc": function() {
      assert.throws(function() {
        var topology = unify(arcify({
          foo: {
            type: "LineString",
            coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
          },
          bar: {
            type: "LineString",
            coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]
          }
        }));
      }, Error);
    },
    "not yet implemented: when a new arc skips a point with a reversed old arc": function() {
      assert.throws(function() {
        var topology = unify(arcify({
          foo: {
            type: "LineString",
            coordinates: [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]]
          },
          bar: {
            type: "LineString",
            coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]
          }
        }));
      }, Error);
    }
  }
});

suite.export(module);
