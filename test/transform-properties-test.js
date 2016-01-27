var tape = require("tape"),
    transformProperties = require("../lib/topojson/transform-properties");

tape("transform-properties by default, deletes properties from Features", function(test) {
  test.deepEqual(transformProperties({
    foo: {
      type: "Feature",
      properties: {"foo": 42},
      geometry: {
        type: "LineString",
        coordinates: [0]
      }
    }
  }).foo, {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [0]
    }
  });
  test.end();
});

tape("transform-properties observes the specified property transform function", function(test) {
  test.deepEqual(transformProperties({
    foo: {
      type: "Feature",
      properties: {"foo": 42},
      geometry: {
        type: "LineString",
        coordinates: [0]
      }
    }
  }, function(object) {
    return {
      bar: object.properties.foo
    };
  }).foo, {
    type: "Feature",
    properties: {"bar": 42},
    geometry: {
      type: "LineString",
      coordinates: [0]
    }
  });
  test.end();
});
