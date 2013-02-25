var vows = require("vows"),
    assert = require("assert"),
    topojson = require("../");

var suite = vows.describe("topojson.object");

suite.addBatch({
  "object": {
    "the object type is preserved": function() {
      var t = simpleTopology({type: "Polygon", arcs: [[0]]});
      assert.equal(topojson.object(t, t.objects.foo).type, "Polygon");
    },

    "Point is a valid object type": function() {
      var t = simpleTopology({type: "Point", coordinates: [0, 0]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "Point", coordinates: [0, 0]});
    },

    "MultiPoint is a valid object type": function() {
      var t = simpleTopology({type: "MultiPoint", coordinates: [[0, 0]]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "MultiPoint", coordinates: [[0, 0]]});
    },

    "LineString is a valid object type": function() {
      var t = simpleTopology({type: "LineString", arcs: [0]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "LineString", coordinates: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]});
    },

    "MultiLineString is a valid object type": function() {
      var t = simpleTopology({type: "LineString", arcs: [0]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "LineString", coordinates: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]});
    },

    "line-strings have at least two coordinates": function() {
      var t = simpleTopology({type: "LineString", arcs: [3]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "LineString", coordinates: [[1, 1], [1, 1]]});
      var t = simpleTopology({type: "MultiLineString", arcs: [[3], [4]]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "MultiLineString", coordinates: [[[1, 1], [1, 1]], [[0, 0], [0, 0]]]});
    },

    "Polygon is a valid object type": function() {
      var t = simpleTopology({type: "Polygon", arcs: [[0]]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]});
    },

    "MultiPolygon is a valid object type": function() {
      var t = simpleTopology({type: "MultiPolygon", arcs: [[[0]]]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "MultiPolygon", coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]});
    },

    "polygons are closed, with at least four coordinates": function() {
      var topology = {
        type: "Topology",
        transform: {scale: [1, 1], translate: [0, 0]},
        objects: {foo: {type: "Polygon", arcs: [[0]]}, bar: {type: "Polygon", arcs: [[0, 1]]}},
        arcs: [[[0, 0], [1, 1]], [[1, 1], [-1, -1]]]
      };
      assert.deepEqual(topojson.object(topology, topology.objects.foo).coordinates, [[[0, 0], [1, 1], [0, 0], [0, 0]]]);
      assert.deepEqual(topojson.object(topology, topology.objects.bar).coordinates, [[[0, 0], [1, 1], [0, 0], [0, 0]]]);
    },

    "GeometryCollection is a valid object type": function() {
      var t = simpleTopology({type: "GeometryCollection", geometries: [{type: "MultiPolygon", arcs: [[[0]]]}]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "GeometryCollection", geometries: [{type: "MultiPolygon", coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]}]});
    },

    "geometry collections can be nested": function() {
      var t = simpleTopology({type: "GeometryCollection", geometries: [{type: "GeometryCollection", geometries: [{type: "Point", coordinates: [0, 0]}]}]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "GeometryCollection", geometries: [{type: "GeometryCollection", geometries: [{type: "Point", coordinates: [0, 0]}]}]});
    },

    "nested geometry collections can have ids": function() {
      var t = simpleTopology({type: "GeometryCollection", id: "outer", geometries: [{type: "GeometryCollection", id: "inner", geometries: [{type: "Point", id: "geometry", coordinates: [0, 0]}]}]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "GeometryCollection", id: "outer", geometries: [{type: "GeometryCollection", id: "inner", geometries: [{type: "Point", id: "geometry", coordinates: [0, 0]}]}]});
    },

    "nested geometry collections can have properties": function() {
      var t = simpleTopology({type: "GeometryCollection", properties: {outer: true}, geometries: [{type: "GeometryCollection", properties: {inner: true}, geometries: [{type: "Point", properties: {geometry: true}, coordinates: [0, 0]}]}]});
      assert.deepEqual(topojson.object(t, t.objects.foo), {type: "GeometryCollection", properties: {outer: true}, geometries: [{type: "GeometryCollection", properties: {inner: true}, geometries: [{type: "Point", properties: {geometry: true}, coordinates: [0, 0]}]}]});
    },

    "the object id is preserved": function() {
      var t = simpleTopology({id: "foo", type: "Polygon", arcs: [[0]]});
      assert.equal(topojson.object(t, t.objects.foo).id, "foo");
    },

    "any object properties are preserved": function() {
      var t = simpleTopology({type: "Polygon", properties: {color: "orange", size: 42}, arcs: [[0]]});
      assert.deepEqual(topojson.object(t, t.objects.foo).properties, {color: "orange", size: 42});
    },

    "the object id is optional": function() {
      var t = simpleTopology({type: "Polygon", arcs: [[0]]});
      assert.isUndefined(topojson.object(t, t.objects.foo).properties);
    },

    "object properties are optional": function() {
      var t = simpleTopology({type: "Polygon", arcs: [[0]]});
      assert.isUndefined(topojson.object(t, t.objects.foo).properties);
    },

    "arcs are converted to coordinates": function() {
      var t = simpleTopology({type: "Polygon", arcs: [[0]]});
      assert.deepEqual(topojson.object(t, t.objects.foo).coordinates, [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
    },

    "negative arc indexes indicate reversed coordinates": function() {
      var t = simpleTopology({type: "Polygon", arcs: [[~0]]});
      assert.deepEqual(topojson.object(t, t.objects.foo).coordinates, [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]);
    },

    "when multiple arc indexes are specified, coordinates are stitched together": function() {
      var t = simpleTopology({type: "LineString", arcs: [1, 2]});
      assert.deepEqual(topojson.object(t, t.objects.foo).coordinates, [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);
      var t = simpleTopology({type: "Polygon", arcs: [[~2, ~1]]});
      assert.deepEqual(topojson.object(t, t.objects.foo).coordinates, [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]);
    },

    "unknown geometry types are converted to type-null geometries": function() {
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
      assert.deepEqual(topojson.object(topology, topology.objects.foo), {type: null, id: "foo"});
      assert.deepEqual(topojson.object(topology, topology.objects.bar), {type: null, properties: {bar: 2}});
      assert.deepEqual(topojson.object(topology, topology.objects.baz), {type: "GeometryCollection", geometries: [{type: null, id: "unknown"}]});
    }
  }
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

suite.export(module);
