var vows = require("vows"),
    assert = require("assert"),
    arcify = require("../../lib/topojson/topology/arcify");

var suite = vows.describe("arcify");

suite.addBatch({
  "arcify": {
    "copies coordinates sequentially into a buffer": function() {
      var topology = arcify({
        foo: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        },
        bar: {
          type: "LineString",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      });
      assert.deepEqual(Array.apply([], topology.coordinates), [0, 0, 1, 0, 2, 0, 0, 0, 1, 0, 2, 0]);
    },
    "does not copy point geometries into the coordinate buffer": function() {
      var topology = arcify({
        foo: {
          type: "Point",
          coordinates: [0, 0]
        },
        bar: {
          type: "MultiPoint",
          coordinates: [[0, 0], [1, 0], [2, 0]]
        }
      });
      assert.deepEqual(Array.apply([], topology.coordinates), []);
      assert.deepEqual(topology.objects.foo.coordinates, [0, 0]);
      assert.deepEqual(topology.objects.bar.coordinates, [[0, 0], [1, 0], [2, 0]]);
    },
    "includes closing coordinates in polygons": function() {
      var topology = arcify({
        foo: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [2, 0], [0, 0]]]
        }
      });
      assert.deepEqual(Array.apply([], topology.coordinates), [0, 0, 1, 0, 2, 0, 0, 0]);
    },
    "represents arcs as contiguous slices of the coordinate buffer": function() {
      var topology = arcify({
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
          coordinates: {start: 0, end: 3, next: null}
        },
        bar: {
          type: "LineString",
          coordinates: {start: 3, end: 6, next: null}
        }
      });
    },
    "exposes the constructed arcs in the order of construction": function() {
      var topology = arcify({
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
      assert.deepEqual(topology.arcs, [
        {start: 0, end: 3, next: null},
        {start: 3, end: 6, next: null},
        {start: 6, end: 10, next: null}
      ]);
    },
    "converts singular multipoints to points": function() {
      var topology = arcify({
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
      var topology = arcify({
        foo: {
          type: "MultiLineString",
          coordinates: [[[0, 0], [0, 1]]]
        }
      });
      assert.deepEqual(topology.objects.foo, {
        type: "LineString",
        coordinates: {start: 0, end: 2, next: null}
      });
    },
    "converts singular multipolygons to polygons": function() {
      var topology = arcify({
        foo: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [0, 1], [1, 0], [0, 0]]]]
        }
      });
      assert.deepEqual(topology.objects.foo, {
        type: "Polygon",
        coordinates: [{start: 0, end: 4, next: null}]
      });
    },
    "preserves properties and id on top-level features": function() {
      var topology = arcify({
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
        type: "Feature",
        id: "foo",
        properties: {
          "foo": 42,
        },
        geometry: {
          type: "LineString",
          coordinates: {start: 0, end: 2, next: null}
        }
      });
    },
    "preserves properties and id on feature in collections": function() {
      var topology = arcify({
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
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          id: "foo",
          properties: {
            "foo": 42,
          },
          geometry: {
            type: "LineString",
            coordinates: {start: 0, end: 2, next: null}
          }
        }]
      });
    },
    "supports nested geometry collections": function() {
      var topology = arcify({
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
        type: "Feature",
        id: undefined,
        properties: undefined,
        geometry: {
          type: "GeometryCollection",
          geometries: [{
            type: "LineString",
            coordinates: {start: 0, end: 2, next: null}
          }]
        }
      });
    }
  }
});

suite.export(module);
