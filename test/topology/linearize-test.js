var vows = require("vows"),
    assert = require("assert"),
    linearize = require("../../lib/topojson/topology/linearize");

var suite = vows.describe("linearize");

suite.addBatch({
  "linearize": {
    "copies coordinates sequentially into a buffer": function() {
      var topology = linearize({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      });
      assert.deepEqual(topology.coordinates, [[0, 0], [1, 0], [2, 0], [0, 0], [1, 0], [2, 0]]);
    },
    "does not copy point geometries into the coordinate buffer": function() {
      var topology = linearize({
        foo: {
          type: "Point",
          coordinates: [0, 0]
        },
        bar: {
          type: "MultiPoint",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      });
      assert.deepEqual(topology.coordinates, []);
      assert.deepEqual(topology.objects.foo.coordinates, [0, 0]);
      assert.deepEqual(topology.objects.bar.coordinates, [[0, 0], [1, 0], [2, 0]]);
    },
    "includes closing coordinates in polygons": function() {
      var topology = linearize({
        foo: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
        }
      });
      assert.deepEqual(topology.coordinates, [[0, 0], [1, 0], [2, 0], [0, 0]]);
    },
    "represents lines as contiguous slices of the coordinate buffer": function() {
      var topology = linearize({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      });
      assert.deepEqual(topology.objects, {
        foo: {
          type: "LineString",
          arcs: [0, 2]
        },
        bar: {
          type: "LineString",
          arcs: [3, 5]
        }
      });
    },
    "represents rings as contiguous slices of the coordinate buffer": function() {
      var topology = linearize({
        foo: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
        },
        bar: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
        }
      });
      assert.deepEqual(topology.objects, {
        foo: {
          type: "Polygon",
          arcs: [[0, 3]]
        },
        bar: {
          type: "Polygon",
          arcs: [[4, 7]]
        }
      });
    },
    "exposes the constructed lines and rings in the order of construction": function() {
      var topology = linearize({
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
      assert.deepEqual(topology.lines, [
        [0, 2],
        [3, 5]
      ]);
      assert.deepEqual(topology.rings, [
        [6, 9]
      ]);
    },
    "converts singular multipoints to points": function() {
      var topology = linearize({
        foo: {
          type: "MultiPoint",
          coordinates: [[0, 0]]
        }
      });
      assert.deepEqual(topology.objects.foo, {
        type: "Point",
        coordinates: [0, 0]
      });
    },
    "converts singular multilines to lines": function() {
      var topology = linearize({
        foo: {
          type: "MultiLineString",
          coordinates: [[[0, 0], [0, 1]]]
        }
      });
      assert.deepEqual(topology.objects.foo, {
        type: "LineString",
        arcs: [0, 1]
      });
    },
    "converts singular multipolygons to polygons": function() {
      var topology = linearize({
        foo: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [0, 1], [1, 0], [0, 0]]]]
        }
      });
      assert.deepEqual(topology.objects.foo, {
        type: "Polygon",
        arcs: [[0, 3]]
      });
    },
    "preserves properties and id on top-level features": function() {
      var topology = linearize({
        foo: {
          type: "Feature",
          id: "foo",
          properties: {
            "foo": 42,
          },
          geometry: {
            type: "LineString",
            coordinates: [[0, 0], [0, 1]]
          }
        }
      });
      assert.deepEqual(topology.objects.foo, {
        type: "LineString",
        id: "foo",
        properties: {
          "foo": 42,
        },
        arcs: [0, 1]
      });
    },
    "preserves properties and id on feature in collections": function() {
      var topology = linearize({
        foo: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            id: "foo",
            properties: {
              "foo": 42,
            },
            geometry: {
              type: "LineString",
              coordinates: [[0, 0], [0, 1]]
            }
          }]
        }
      });
      assert.deepEqual(topology.objects.foo, {
        type: "GeometryCollection",
        geometries: [{
          type: "LineString",
          id: "foo",
          properties: {
            "foo": 42,
          },
          arcs: [0, 1]
        }]
      });
    },
    "supports nested geometry collections": function() {
      var topology = linearize({
        foo: {
          type: "Feature",
          geometry: {
            type: "GeometryCollection",
            geometries: [{
              type: "LineString",
              coordinates: [[0, 0], [0, 1]]
            }]
          }
        }
      });
      assert.deepEqual(topology.objects.foo, {
        type: "GeometryCollection",
        geometries: [{
          type: "LineString",
          arcs: [0, 1]
        }]
      });
    }
  }
});

suite.export(module);
