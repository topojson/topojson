var vows = require("vows"),
    assert = require("assert"),
    topojson = require("../");

var suite = vows.describe("topojson.topology");

suite.addBatch({
  "topology": {
    "input objects are mapped to topology.objects": function() {
      var topology = topojson.topology({
        foo: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]},
        bar: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}
      });
      assert.equal(topology.objects.foo.type, "LineString");
      assert.equal(topology.objects.bar.type, "Polygon");
    },
    "features are mapped to geometries": function() {
      var topology = topojson.topology({
        foo: {type: "Feature", geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}},
        bar: {type: "Feature", geometry: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}}
      });
      assert.equal(topology.objects.foo.type, "LineString");
      assert.equal(topology.objects.bar.type, "Polygon");
    },
    "feature collections are mapped to geometry collections": function() {
      var topology = topojson.topology({
        collection: {
          type: "FeatureCollection",
          features: [
            {type: "Feature", geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}},
            {type: "Feature", geometry: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}}
          ]
        }
      });
      assert.equal(topology.objects.collection.type, "GeometryCollection");
      assert.equal(topology.objects.collection.geometries.length, 2);
      assert.equal(topology.objects.collection.geometries[0].type, "LineString")
      assert.equal(topology.objects.collection.geometries[1].type, "Polygon");
    },
    "converting a feature to a geometry preserves its id": function() {
      var topology = topojson.topology({foo: {id: "Foo", type: "Feature", geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}});
      assert.equal(topology.objects.foo.type, "LineString");
      assert.equal(topology.objects.foo.id, "Foo");
    },
    "the returned transform exactly encompasses the input geometry": function() {
      var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/4]]}}, {quantization: 2});
      assert.deepEqual(topology.transform, {scale: [3/8, 3/16], translate: [1/8, 1/16]});
      var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, {quantization: 2});
      assert.deepEqual(topology.transform, {scale: [3/8, 3/16], translate: [1/8, 1/16]});
    },
    "arc coordinates are integers with delta encoding": function() {
      var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/16], [1/8, 1/4], [1/2, 1/4]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [-1, 1], [1, 0]]);
      var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]);
    },
    "precision of quantization is configurable": function() {
      var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/16], [1/8, 1/4], [1/2, 1/4]]}}, {quantization: 3});
      assert.deepEqual(topology.arcs[0], [[0, 0], [2, 0], [-2, 2], [2, 0]]);
      var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, {quantization: 5});
      assert.deepEqual(topology.arcs[0], [[0, 0], [4, 0], [0, 4], [-4, 0], [0, -4]]);
    },
    "coincident points are removed": function() {
      var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/8, 1/16], [1/2, 1/4], [1/2, 1/4]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 1]]);
      var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]);
    },
    "empty lines in a MultiLineString are removed": function() {
      var topology = topojson.topology({foo: {type: "MultiLineString", coordinates: [[[1/8, 1/16], [1/2, 1/4]], [], [[1/8, 1/16]], [[1/8, 1/16], [1/8, 1/16]], [[1/2, 1/4], [1/8, 1/16]]]}}, {quantization: 2});
      assert.equal(topology.arcs.length, 1);
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 1]]);
      assert.deepEqual(topology.objects.foo.arcs, [[0], [~0]]);
    },
    "empty polygons in a MultiPolygon are removed": function() {
      var topology = topojson.topology({foo: {type: "MultiPolygon", coordinates: [
        [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]],
        [[[1/8, 1/16]]],
        [[[1/8, 1/16], [1/8, 1/16]]],
        [[[1/8, 1/16], [1/8, 1/4], [1/2, 1/4], [1/2, 1/16], [1/8, 1/16]]]
      ]}}, {quantization: 2});
      assert.equal(topology.arcs.length, 1);
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]);
      assert.deepEqual(topology.objects.foo.arcs, [[[0]], [[~0]]]);
    },
    "empty geometries in a GeometryCollection are removed": function() {
      var topology = topojson.topology({collection: {type: "FeatureCollection", features: [{type: "Feature", geometry: {type: "MultiPolygon", coordinates: []}}]}}, {quantization: 2});
      assert.equal(topology.arcs.length, 0);
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: []});
    },
    "empty geometries are not removed": function() {
      var topology = topojson.topology({foo: {type: "MultiPolygon", coordinates: []}}, {quantization: 2});
      assert.equal(topology.arcs.length, 0);
      assert.deepEqual(topology.objects.foo, {type: "MultiPolygon", arcs: []});
    },
    "the lines AB and AB share the same arc": function() {
      //
      // A-----B
      //
      var topology = topojson.topology({
        ab: {type: "LineString", coordinates: [[0, 0], [0, 1]]},
        ba: {type: "LineString", coordinates: [[0, 0], [0, 1]]}
      });
      assert.deepEqual(topology.objects.ab, {type: "LineString", arcs: [0]})
      assert.deepEqual(topology.objects.ba, {type: "LineString", arcs: [0]});
    },
    "the lines AB and BA share the same arc, reversed": function() {
      //
      // A-----B
      //
      var topology = topojson.topology({
        ab: {type: "LineString", coordinates: [[0, 0], [0, 1]]},
        ba: {type: "LineString", coordinates: [[0, 1], [0, 0]]}
      });
      assert.deepEqual(topology.objects.ab, {type: "LineString", arcs: [0]})
      assert.deepEqual(topology.objects.ba, {type: "LineString", arcs: [~0]});
    },
    "the lines ACD and BCD share one of three arcs": function() {
      //
      // A
      //  \
      //   \
      //    \
      //     \
      //      \
      // B-----C-----D
      //
      var topology = topojson.topology({
        acd: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1]]},
        bcd: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1]]}
      });
      assert.deepEqual(topology.objects.acd, {type: "LineString", arcs: [0, 1]})
      assert.deepEqual(topology.objects.bcd, {type: "LineString", arcs: [2, 1]});
    },
    "the lines ACD and DCB share one of three arcs, reversed": function() {
      //
      // A
      //  \
      //   \
      //    \
      //     \
      //      \
      // B-----C-----D
      //
      var topology = topojson.topology({
        acd: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1]]},
        dcb: {type: "LineString", coordinates: [[2, 1], [1, 1], [0, 1]]}
      }, {quantization: 3});
      assert.deepEqual(topology.arcs, [
        [[0, 0], [1, 2]], // AC
        [[1, 2], [1, 0]], // CD
        [[1, 2], [-1, 0]], // CB
      ]);
      assert.deepEqual(topology.objects.acd, {type: "LineString", arcs: [0, 1]})
      assert.deepEqual(topology.objects.dcb, {type: "LineString", arcs: [~1, 2]});
    },
    "the polygons ABCDA and BEFCB share one of three arcs, reversed": function() {
      //
      // A-----B-----E
      // |     |     |
      // |     |     |
      // |     |     |
      // |     |     |
      // |     |     |
      // D-----C-----F
      //
      var topology = topojson.topology({
        abcda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
        befcb: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]]}
      }, {quantization: 3});
      assert.deepEqual(topology.arcs, [
        [[1, 0], [0, 2]], // BC
        [[1, 2], [-1, 0], [0, -2], [1, 0]], // CDAB
        [[1, 0], [1, 0], [0, 2], [-1, 0]] // BEFC
      ]);
      assert.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0, 1]]})
      assert.deepEqual(topology.objects.befcb, {type: "Polygon", arcs: [[~0, 2]]});
    },
    "the polygons ABCA, ACDA and BFCB share some of five arcs": function() {
      //
      // A-----B
      // |\    |\
      // | \   | \
      // |  \  |  \
      // |   \ |   \
      // |    \|    \
      // D-----C-----F
      //
      var topology = topojson.topology({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]},
        acda: {type: "Polygon", coordinates: [[[0, 0], [1, 1], [0, 1], [0, 0]]]},
        bfcb: {type: "Polygon", coordinates: [[[1, 0], [2, 1], [1, 1], [1, 0]]]}
      }, {quantization: 3});
      assert.deepEqual(topology.arcs, [
        [[1, 2], [-1, -2]], // CA
        [[0, 0], [1, 0]], // AB
        [[1, 0], [0, 2]], // BC
        [[1, 2], [-1, 0], [0, -2]], // CDA
        [[1, 0], [1, 2], [-1, 0]] // BFC
      ]);
      assert.deepEqual(topology.objects.abca, {type: "Polygon", arcs: [[0, 1, 2]]})
      assert.deepEqual(topology.objects.acda, {type: "Polygon", arcs: [[3, ~0]]});
      assert.deepEqual(topology.objects.bfcb, {type: "Polygon", arcs: [[~2, 4]]});
    }
  }
});

suite.export(module);
