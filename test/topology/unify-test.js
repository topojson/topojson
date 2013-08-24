var vows = require("vows"),
    assert = require("assert"),
    arcify = require("../../lib/topojson/topology/arcify"),
    unify = require("../../lib/topojson/topology/unify");

var suite = vows.describe("unify");

suite.addBatch({
  "unify": {
    "detects exact duplicate arcs": function() {
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
    "detects reversed duplicate arcs": function() {
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
    "detects when a coincident arc extends the current arc": function() {
      assert.throws(function() {
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
      }, Error); // not yet implemented
    },
    "detects when a reversed coincident arc extends the current arc": function() {
      assert.throws(function() {
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
      }, Error); // not yet implemented
    },
    "detects when the current arc extends a coincident arc": function() {
      assert.throws(function() {
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
      }, Error); // not yet implemented
    },
    "detects when the current arc extends a reversed coincident arc": function() {
      assert.throws(function() {
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
      }, Error); // not yet implemented
    }
  }
});

suite.export(module);
