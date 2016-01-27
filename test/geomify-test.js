var tape = require("tape"),
    geomify = require("../lib/topojson/geomify");

tape("geomify replaces LineString Feature with LineString Geometry", function(test) {
  test.deepEqual(geomify({
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
  test.end();
});

tape("geomify replaces GeometryCollection Feature with GeometryCollection", function(test) {
  test.deepEqual(geomify({
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
  test.end();
});

tape("geomify replaces FeatureCollection with GeometryCollection", function(test) {
  test.deepEqual(geomify({
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
  test.end();
});

tape("geomify replaces Feature with null Geometry with null-type Geometry", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "Feature",
      geometry: null
    }
  }), {
    foo: {
      type: null
    }
  });
  test.end();
});

tape("geomify replaces top-level null Geometry with null-type Geometry", function(test) {
  test.deepEqual(geomify({
    foo: null
  }), {
    foo: {
      type: null
    }
  });
  test.end();
});

tape("geomify replaces null Geometry in GeometryCollection with null-type Geometry", function(test) {
  test.deepEqual(geomify({
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
  test.end();
});

tape("geomify preserves id", function(test) {
  test.deepEqual(geomify({
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
  test.end();
});

tape("geomify preserves properties", function(test) {
  test.deepEqual(geomify({
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
  test.end();
});

tape("geomify does not delete empty properties", function(test) {
  test.deepEqual(geomify({
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
  test.end();
});

tape("geomify converts singular multipoints to points", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "MultiPoint",
      coordinates: [[0, 0]]
    }
  }), {
    foo: {
      type: "Point",
      coordinates: [0, 0]
    }
  });
  test.end();
});

tape("geomify converts empty multipoints to null", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "MultiPoint",
      coordinates: []
    }
  }), {
    foo: {
      type: null
    }
  });
  test.end();
});

tape("geomify converts singular multilines to lines", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "MultiLineString",
      coordinates: [[[0, 0], [0, 1]]]
    }
  }), {
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [0, 1]]
    }
  });
  test.end();
});

tape("geomify converts empty lines to null", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "LineString",
      coordinates: []
    }
  }), {
    foo: {
      type: null
    }
  });
  test.end();
});

tape("geomify converts empty multilines to null", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "MultiLineString",
      coordinates: []
    },
    bar: {
      type: "MultiLineString",
      coordinates: [[]]
    }
  }), {
    foo: {
      type: null
    },
    bar: {
      type: null
    }
  });
  test.end();
});

tape("geomify strips empty rings in polygons", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]], []]
    }
  }), {
    foo: {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]
    }
  });
  test.end();
});

tape("geomify strips empty lines in multilines", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "MultiLineString",
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]], [], [[0, 0], [1, 0]]]
    }
  }), {
    foo: {
      type: "MultiLineString",
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]], [[0, 0], [1, 0]]]
    }
  });
  test.end();
});

tape("geomify converts empty polygons to null", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "Polygon",
      coordinates: []
    },
    bar: {
      type: "Polygon",
      coordinates: [[]]
    }
  }), {
    foo: {
      type: null
    },
    bar: {
      type: null
    }
  });
  test.end();
});

tape("geomify strips empty polygons in multipolygons", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "MultiPolygon",
      coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 0]], []], [], [[]]]
    }
  }), {
    foo: {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]
    }
  });
  test.end();
});

tape("geomify converts singular multipolygons to polygons", function(test) {
  test.deepEqual(geomify({
    foo: {
      type: "MultiPolygon",
      coordinates: [[[[0, 0], [0, 1], [1, 0], [0, 0]]]]
    }
  }), {
    foo: {
      type: "Polygon",
      coordinates: [[[0, 0], [0, 1], [1, 0], [0, 0]]]
    }
  });
  test.end();
});
