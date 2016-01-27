var tape = require("tape"),
    topojson = require("../");

tape("feature the geometry type is preserved", function(test) {
  var t = simpleTopology({type: "Polygon", arcs: [[0]]});
  test.equal(topojson.feature(t, t.objects.foo).geometry.type, "Polygon");
  test.end();
});

tape("feature Point is a valid geometry type", function(test) {
  var t = simpleTopology({type: "Point", coordinates: [0, 0]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "Feature", properties: {}, geometry: {type: "Point", coordinates: [0, 0]}});
  test.end();
});

tape("feature MultiPoint is a valid geometry type", function(test) {
  var t = simpleTopology({type: "MultiPoint", coordinates: [[0, 0]]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "Feature", properties: {}, geometry: {type: "MultiPoint", coordinates: [[0, 0]]}});
  test.end();
});

tape("feature LineString is a valid geometry type", function(test) {
  var t = simpleTopology({type: "LineString", arcs: [0]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "Feature", properties: {}, geometry: {type: "LineString", coordinates: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]}});
  test.end();
});

tape("feature MultiLineString is a valid geometry type", function(test) {
  var t = simpleTopology({type: "LineString", arcs: [0]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "Feature", properties: {}, geometry: {type: "LineString", coordinates: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]}});
  test.end();
});

tape("feature line-strings have at least two coordinates", function(test) {
  var t = simpleTopology({type: "LineString", arcs: [3]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "Feature", properties: {}, geometry: {type: "LineString", coordinates: [[1, 1], [1, 1]]}});
  var t = simpleTopology({type: "MultiLineString", arcs: [[3], [4]]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "Feature", properties: {}, geometry: {type: "MultiLineString", coordinates: [[[1, 1], [1, 1]], [[0, 0], [0, 0]]]}});
  test.end();
});

tape("feature Polygon is a valid feature type", function(test) {
  var t = simpleTopology({type: "Polygon", arcs: [[0]]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "Feature", properties: {}, geometry: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}});
  test.end();
});

tape("feature MultiPolygon is a valid feature type", function(test) {
  var t = simpleTopology({type: "MultiPolygon", arcs: [[[0]]]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "Feature", properties: {}, geometry: {type: "MultiPolygon", coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]}});
  test.end();
});

tape("feature polygons are closed, with at least four coordinates", function(test) {
  var topology = {
    type: "Topology",
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {foo: {type: "Polygon", arcs: [[0]]}, bar: {type: "Polygon", arcs: [[0, 1]]}},
    arcs: [[[0, 0], [1, 1]], [[1, 1], [-1, -1]]]
  };
  test.deepEqual(topojson.feature(topology, topology.objects.foo).geometry.coordinates, [[[0, 0], [1, 1], [0, 0], [0, 0]]]);
  test.deepEqual(topojson.feature(topology, topology.objects.bar).geometry.coordinates, [[[0, 0], [1, 1], [0, 0], [0, 0]]]);
  test.end();
});

tape("feature top-level geometry collections are mapped to feature collections", function(test) {
  var t = simpleTopology({type: "GeometryCollection", geometries: [{type: "MultiPolygon", arcs: [[[0]]]}]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "FeatureCollection", features: [{type: "Feature", properties: {}, geometry: {type: "MultiPolygon", coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]}}]});
  test.end();
});

tape("feature geometry collections can be nested", function(test) {
  var t = simpleTopology({type: "GeometryCollection", geometries: [{type: "GeometryCollection", geometries: [{type: "Point", coordinates: [0, 0]}]}]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "FeatureCollection", features: [{type: "Feature", properties: {}, geometry: {type: "GeometryCollection", geometries: [{type: "Point", coordinates: [0, 0]}]}}]});
  test.end();
});

tape("feature top-level geometry collections do not have ids, but second-level geometry collections can", function(test) {
  var t = simpleTopology({type: "GeometryCollection", id: "collection", geometries: [{type: "GeometryCollection", id: "feature", geometries: [{type: "Point", id: "geometry", coordinates: [0, 0]}]}]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "FeatureCollection", features: [{type: "Feature", id: "feature", properties: {}, geometry: {type: "GeometryCollection", geometries: [{type: "Point", coordinates: [0, 0]}]}}]});
  test.end();
});

tape("feature top-level geometry collections do not have properties, but second-level geometry collections can", function(test) {
  var t = simpleTopology({type: "GeometryCollection", properties: {collection: true}, geometries: [{type: "GeometryCollection", properties: {feature: true}, geometries: [{type: "Point", properties: {geometry: true}, coordinates: [0, 0]}]}]});
  test.deepEqual(topojson.feature(t, t.objects.foo), {type: "FeatureCollection", features: [{type: "Feature", properties: {feature: true}, geometry: {type: "GeometryCollection", geometries: [{type: "Point", coordinates: [0, 0]}]}}]});
  test.end();
});

tape("feature the object id is promoted to feature id", function(test) {
  var t = simpleTopology({id: "foo", type: "Polygon", arcs: [[0]]});
  test.equal(topojson.feature(t, t.objects.foo).id, "foo");
  test.end();
});

tape("feature any object properties are promoted to feature properties", function(test) {
  var t = simpleTopology({type: "Polygon", properties: {color: "orange", size: 42}, arcs: [[0]]});
  test.deepEqual(topojson.feature(t, t.objects.foo).properties, {color: "orange", size: 42});
  test.end();
});

tape("feature the object id is optional", function(test) {
  var t = simpleTopology({type: "Polygon", arcs: [[0]]});
  test.equal(topojson.feature(t, t.objects.foo).id, undefined);
  test.end();
});

tape("feature object properties are created if missing", function(test) {
  var t = simpleTopology({type: "Polygon", arcs: [[0]]});
  test.deepEqual(topojson.feature(t, t.objects.foo).properties, {});
  test.end();
});

tape("feature arcs are converted to coordinates", function(test) {
  var t = simpleTopology({type: "Polygon", arcs: [[0]]});
  test.deepEqual(topojson.feature(t, t.objects.foo).geometry.coordinates, [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
  test.end();
});

tape("feature negative arc indexes indicate reversed coordinates", function(test) {
  var t = simpleTopology({type: "Polygon", arcs: [[~0]]});
  test.deepEqual(topojson.feature(t, t.objects.foo).geometry.coordinates, [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]);
  test.end();
});

tape("feature when multiple arc indexes are specified, coordinates are stitched together", function(test) {
  var t = simpleTopology({type: "LineString", arcs: [1, 2]});
  test.deepEqual(topojson.feature(t, t.objects.foo).geometry.coordinates, [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);
  var t = simpleTopology({type: "Polygon", arcs: [[~2, ~1]]});
  test.deepEqual(topojson.feature(t, t.objects.foo).geometry.coordinates, [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]);
  test.end();
});

tape("feature unknown geometry types are converted to null geometries", function(test) {
  var topology = {
    type: "Topology",
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {
      foo: {id: "foo"},
      bar: {type: "Invalid", properties: {bar: 2}},
      baz: {type: "GeometryCollection", geometries: [{type: "Unknown", id: "unknown"}]}
    },
    arcs: []
  };
  test.deepEqual(topojson.feature(topology, topology.objects.foo), {type: "Feature", id: "foo", properties: {}, geometry: null});
  test.deepEqual(topojson.feature(topology, topology.objects.bar), {type: "Feature", properties: {bar: 2}, geometry: null});
  test.deepEqual(topojson.feature(topology, topology.objects.baz), {type: "FeatureCollection", features: [{type: "Feature", id: "unknown", properties: {}, geometry: null}]});
  test.end();
});

function simpleTopology(object) {
  return {
    type: "Topology",
    transform: {scale: [1, 1], translate: [0, 0]},
    objects: {foo: object},
    arcs: [
      [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]],
      [[0, 0], [1, 0], [0, 1]],
      [[1, 1], [-1, 0], [0, -1]],
      [[1, 1]],
      [[0, 0]]
    ]
  };
}
