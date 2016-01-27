var tape = require("tape"),
    computeId = require("../lib/topojson/compute-id");

tape("compute-id by default, preserves the id of the feature", function(test) {
  test.deepEqual(computeId({
    foo: {
      type: "Feature",
      id: "foo",
      geometry: {
        type: "LineString",
        coordinates: [0]
      }
    }
  }).foo, {
    type: "Feature",
    id: "foo",
    geometry: {
      type: "LineString",
      coordinates: [0]
    }
  });
  test.end();
});

tape("compute-id observes the specified id function", function(test) {
  test.deepEqual(computeId({
    foo: {
      type: "Feature",
      properties: {"name": "foo"},
      geometry: {
        type: "LineString",
        coordinates: [0]
      }
    }
  }, function(feature) {
    return feature.properties.name;
  }).foo, {
    type: "Feature",
    id: "foo",
    properties: {"name": "foo"},
    geometry: {
      type: "LineString",
      coordinates: [0]
    }
  });
  test.end();
});

