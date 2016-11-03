var tape = require("tape"),
    internals = require("../build/topojson-internals"),
    geometry = internals.geometry;

tape("geometry replaces LineString Feature with LineString Geometry", function(test) {
  test.deepEqual(geometry({
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

tape("geometry replaces GeometryCollection Feature with GeometryCollection", function(test) {
  test.deepEqual(geometry({
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

tape("geometry replaces FeatureCollection with GeometryCollection", function(test) {
  test.deepEqual(geometry({
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

tape("geometry replaces Feature with null Geometry with null-type Geometry", function(test) {
  test.deepEqual(geometry({
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

tape("geometry replaces top-level null Geometry with null-type Geometry", function(test) {
  test.deepEqual(geometry({
    foo: null
  }), {
    foo: {
      type: null
    }
  });
  test.end();
});

tape("geometry replaces null Geometry in GeometryCollection with null-type Geometry", function(test) {
  test.deepEqual(geometry({
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

tape("geometry preserves id", function(test) {
  test.deepEqual(geometry({
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

tape("geometry preserves properties", function(test) {
  test.deepEqual(geometry({
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

tape("geometry does not delete empty properties", function(test) {
  test.deepEqual(geometry({
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

tape("geometry converts singular multipoints to points", function(test) {
  test.deepEqual(geometry({
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

tape("geometry converts empty multipoints to null", function(test) {
  test.deepEqual(geometry({
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

tape("geometry converts singular multilines to lines", function(test) {
  test.deepEqual(geometry({
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

tape("geometry converts empty lines to null", function(test) {
  test.deepEqual(geometry({
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

tape("geometry converts empty multilines to null", function(test) {
  test.deepEqual(geometry({
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

tape("geometry strips empty rings in polygons", function(test) {
  test.deepEqual(geometry({
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

tape("geometry strips empty lines in multilines", function(test) {
  test.deepEqual(geometry({
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

tape("geometry converts empty polygons to null", function(test) {
  test.deepEqual(geometry({
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

tape("geometry strips empty polygons in multipolygons", function(test) {
  test.deepEqual(geometry({
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

tape("geometry converts singular multipolygons to polygons", function(test) {
  test.deepEqual(geometry({
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
