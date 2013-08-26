var vows = require("vows"),
    assert = require("assert"),
    geomify = require("../../lib/topojson/topology/geomify");

var suite = vows.describe("geomify");

suite.addBatch({
  "geomify": {
    "replaces LineString Feature with LineString Geometry": function() {
      assert.deepEqual(geomify({
        foo: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [[0, 0]]
          }
        }
      }), {
        foo: {
          type: "LineString",
          coordinates: [[0, 0]]
        }
      });
    },
    "replaces GeometryCollection Feature with GeometryCollection": function() {
      assert.deepEqual(geomify({
        foo: {
          type: "Feature",
          geometry: {
            type: "GeometryCollection",
            geometries: [{
              type: "LineString",
              coordinates: [[0, 0]]
            }]
          }
        }
      }), {
        foo: {
          type: "GeometryCollection",
          geometries: [{
            type: "LineString",
            coordinates: [[0, 0]]
          }]
        }
      });
    },
    "replaces FeatureCollection with GeometryCollection": function() {
      assert.deepEqual(geomify({
        foo: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [[0, 0]]
            }
          }]
        }
      }), {
        foo: {
          type: "GeometryCollection",
          geometries: [{
            type: "LineString",
            coordinates: [[0, 0]]
          }]
        }
      });
    },
    "replaces Feature with null Geometry with null-type Geometry": function() {
      assert.deepEqual(geomify({
        foo: {
          type: "Feature",
          geometry: null
        }
      }), {
        foo: {
          type: null
        }
      });
    },
    "replaces top-level null Geometry with null-type Geometry": function() {
      assert.deepEqual(geomify({
        foo: null
      }), {
        foo: {
          type: null
        }
      });
    },
    "replaces null Geometry in GeometryCollection with null-type Geometry": function() {
      assert.deepEqual(geomify({
        foo: {
          type: "GeometryCollection",
          geometries: [null]
        }
      }), {
        foo: {
          type: "GeometryCollection",
          geometries: [{
            type: null
          }]
        }
      });
    },
    "preserves id": function() {
      assert.deepEqual(geomify({
        foo: {
          id: "foo",
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [[0, 0]]
          }
        }
      }), {
        foo: {
          id: "foo",
          type: "LineString",
          coordinates: [[0, 0]]
        }
      });
    },
    "preserves properties": function() {
      assert.deepEqual(geomify({
        foo: {
          properties: {
            "foo": 42
          },
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [[0, 0]]
          }
        }
      }), {
        foo: {
          properties: {
            "foo": 42
          },
          type: "LineString",
          coordinates: [[0, 0]]
        }
      });
    },
    "does not delete empty properties": function() {
      assert.deepEqual(geomify({
        foo: {
          properties: {},
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [[0, 0]]
          }
        }
      }), {
        foo: {
          properties: {},
          type: "LineString",
          coordinates: [[0, 0]]
        }
      });
    }
  }
});

suite.export(module);
