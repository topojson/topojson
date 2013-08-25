var vows = require("vows"),
    assert = require("assert"),
    geomify = require("../../lib/topojson/topology/geomify");

var suite = vows.describe("geomify");

suite.addBatch({
  "geomify": {
    "replaces Feature with Geometry": function() {
      assert.deepEqual(geomify({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [0]
            }
          }
        }
      }), {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "LineString",
            arcs: [0]
          }
        }
      });
    },
    "replaces FeatureCollection with GeometryCollection": function() {
      assert.deepEqual(geomify({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "FeatureCollection",
            features: [{
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [0]
              }
            }]
          }
        }
      }), {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "GeometryCollection",
            geometries: [{
              type: "LineString",
              arcs: [0]
            }]
          }
        }
      });
    },
    "replaces Feature with null Geometry with null-type Geometry": function() {
      assert.deepEqual(geomify({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "Feature",
            geometry: null
          }
        }
      }), {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {type: null}
        }
      });
    },
    "replaces top-level null Geometry with null-type Geometry": function() {
      assert.deepEqual(geomify({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: null
        }
      }), {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {type: null}
        }
      });
    },
    "replaces null Geometry in GeometryCollection with null-type Geometry": function() {
      assert.deepEqual(geomify({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "GeometryCollection",
            geometries: [null]
          }
        }
      }), {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            type: "GeometryCollection",
            geometries: [{type: null}]
          }
        }
      });
    },
    "preserves id": function() {
      assert.deepEqual(geomify({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            id: "foo",
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [0]
            }
          }
        }
      }), {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            id: "foo",
            type: "LineString",
            arcs: [0]
          }
        }
      });
    },
    "preserves properties": function() {
      assert.deepEqual(geomify({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            properties: {"foo": 42},
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [0]
            }
          }
        }
      }), {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            properties: {"foo": 42},
            type: "LineString",
            arcs: [0]
          }
        }
      });
    },
    "does not delete empty properties": function() {
      assert.deepEqual(geomify({
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            properties: {type: null},
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [0]
            }
          }
        }
      }), {
        type: "Topology",
        arcs: [
          [[0, 0], [1, 0], [2, 0]]
        ],
        objects: {
          foo: {
            properties: {type: null},
            type: "LineString",
            arcs: [0]
          }
        }
      });
    }
  }
});

suite.export(module);
