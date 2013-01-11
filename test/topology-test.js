var vows = require("vows"),
    assert = require("assert"),
    topojson = require("../");

var suite = vows.describe("topojson.topology");

suite.addBatch({
  "topology": {

    // The topology `objects` is a map of geometry objects by name, allowing
    // multiple GeoJSON geometry objects to share the same topology. When you
    // pass multiple input files to bin/topojson, the basename of the file is
    // used as the key, but you're welcome to edit the file to change it.
    "input objects are mapped to topology.objects": function() {
      var topology = topojson.topology({
        foo: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]},
        bar: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}
      });
      assert.equal(topology.objects.foo.type, "LineString");
      assert.equal(topology.objects.bar.type, "Polygon");
    },

    // TopoJSON doesn't use features because you can represent the same
    // information more compactly just by using geometry objects.
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
      assert.equal(topology.objects.collection.geometries[0].type, "LineString");
      assert.equal(topology.objects.collection.geometries[1].type, "Polygon");
    },
    "features with null geometry objects are ignored in feature collections": function() {
      var topology = topojson.topology({
        collection: {
          type: "FeatureCollection",
          features: [
            {type: "Feature", geometry: null},
            {type: "Feature", geometry: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}}
          ]
        }
      });
      assert.equal(topology.objects.collection.type, "GeometryCollection");
      assert.equal(topology.objects.collection.geometries.length, 1);
      assert.equal(topology.objects.collection.geometries[0].type, "Polygon");
    },
    "top-level features with null geometry objects are ignored": function() {
      var topology = topojson.topology({
        feature: {type: "Feature", geometry: null}
      });
      assert.deepEqual(topology.objects, {});
    },

    // To know what a geometry object represents, specify an id. I prefer
    // numeric identifiers, such as ISO 3166-1 numeric, but strings work too.
    "converting a feature to a geometry preserves its id": function() {
      var topology = topojson.topology({foo: {type: "Feature", id: 42, properties: {}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}});
      assert.equal(topology.objects.foo.type, "LineString");
      assert.equal(topology.objects.foo.id, 42);
    },

    // I prefer to store properties in separate files (such as CSV), so that it
    // can be represented more efficiently. Also, this lets you use the same
    // TopoJSON file in multiple applications. Use the geometry object's id to
    // join with external data, e.g., http://bl.ocks.org/4060606
    "converting a feature to a geometry does not preserve its properties by default": function() {
      var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {name: "George"}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}});
      assert.isUndefined(topology.objects.foo.properties);
    },

    // But you can store properties on TopoJSON geometries, if you insist.
    "a properties filter may be specified to preserve and rename properties": function() {
      var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {UNREASONABLY_LONG_NAME: "George"}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}}, {"property-filter": function(d) { return d; }});
      assert.deepEqual(topology.objects.foo.properties, {UNREASONABLY_LONG_NAME: "George"});
      var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {UNREASONABLY_LONG_NAME: "George"}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}}, {"property-filter": function(d) { return d.replace(/^UNREASONABLY_LONG_/, "").toLowerCase(); }});
      assert.deepEqual(topology.objects.foo.properties, {name: "George"});
    },

    // Unlike GeoJSON's feature.properties, the properties object is optional.
    "if no properties are specified, no properties are emitted": function() {
      var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {name: "George", demeanor: "curious"}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}}, {"property-filter": function(d) { return d === "name" ? d : null; }});
      assert.deepEqual(topology.objects.foo.properties, {name: "George"});
      var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {demeanor: "curious"}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}}, {"property-filter": function(d) { return d === "name" ? d : null; }});
      assert.deepEqual(topology.objects.foo.properties);
    },

    // It's not required by the specification that the transform exactly
    // encompass the input geometry, but this is a good test that the reference
    // implementation is working correctly.
    "the returned transform exactly encompasses the input geometry": function() {
      var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/4]]}}, {quantization: 2});
      assert.deepEqual(topology.transform, {scale: [3/8, 3/16], translate: [1/8, 1/16]});
      var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, {quantization: 2});
      assert.deepEqual(topology.transform, {scale: [3/8, 3/16], translate: [1/8, 1/16]});
    },

    // TopoJSON uses integers with delta encoding to represent geometry
    // efficiently. (Quantization is necessary for simplification anyway, so
    // that we can identify which points are shared by contiguous geometry
    // objects.) The delta encoding works particularly well because line strings
    // are not random: most points are very close to their neighbors!
    "arc coordinates are integers with delta encoding": function() {
      var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/16], [1/8, 1/4], [1/2, 1/4]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [-1, 1], [1, 0]]);
      var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]);
    },

    // TopoJSON uses integers with for points, also. However, there’s no delta-
    // encoding, even for MultiPoints. And, unlike other geometry objects,
    // points are still defined with coordinates rather than arcs.
    "points coordinates are integers with delta encoding": function() {
      var topology = topojson.topology({foo: {type: "Point", coordinates: [1/8, 1/16]}, bar: {type: "Point", coordinates: [1/2, 1/4]}}, {quantization: 2});
      assert.deepEqual(topology.arcs, []);
      assert.deepEqual(topology.objects.foo, {type: "Point", coordinates: [0, 0]});
      assert.deepEqual(topology.objects.bar, {type: "Point", coordinates: [1, 1]});
      var topology = topojson.topology({foo: {type: "MultiPoint", coordinates: [[1/8, 1/16], [1/2, 1/4]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs, []);
      assert.deepEqual(topology.objects.foo, {type: "MultiPoint", coordinates: [[0, 0], [1, 1]]});
    },

    // GeoJSON inputs are in floating point format, so some error may creep in
    // that prevents you from using exact match to determine shared points. The
    // default quantization, 1e4, allows for 10,000 differentiable points in
    // both dimensions. If you're using TopoJSON to represent especially high-
    // precision geometry, you might want to increase the precision; however,
    // this necessarily increases the output size and the likelihood of seams
    // between contiguous geometry after simplification. The quantization factor
    // should be a power of ten for the most efficient representation, since
    // JSON uses base-ten encoding for numbers.
    "precision of quantization is configurable": function() {
      var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/16], [1/8, 1/4], [1/2, 1/4]]}}, {quantization: 3});
      assert.deepEqual(topology.arcs[0], [[0, 0], [2, 0], [-2, 2], [2, 0]]);
      var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, {quantization: 5});
      assert.deepEqual(topology.arcs[0], [[0, 0], [4, 0], [0, 4], [-4, 0], [0, -4]]);
    },

    // Quantization may introduce coincident points, so these are removed.
    "coincident points are removed": function() {
      var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/8, 1/16], [1/2, 1/4], [1/2, 1/4]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 1]]);
      var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, {quantization: 2});
      assert.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]);
    },

    // In exceptional cases, very small geometry objects may collapse down to a
    // single point after quantization. These geometries are therefore removed.
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

    // If one of the top-level objects in the input is empty, however, it is
    // still preserved in the output.
    "empty geometries are not removed": function() {
      var topology = topojson.topology({foo: {type: "MultiPolygon", coordinates: []}}, {quantization: 2});
      assert.equal(topology.arcs.length, 0);
      assert.deepEqual(topology.objects.foo, {type: "MultiPolygon", arcs: []});
    },

    //
    // A-----B
    //
    "the lines AB and AB share the same arc": function() {
      var topology = topojson.topology({
        ab: {type: "LineString", coordinates: [[0, 0], [0, 1]]},
        ba: {type: "LineString", coordinates: [[0, 0], [0, 1]]}
      });
      assert.deepEqual(topology.objects.ab, {type: "LineString", arcs: [0]});
      assert.deepEqual(topology.objects.ba, {type: "LineString", arcs: [0]});
    },

    //
    // A-----B
    //
    "the lines AB and BA share the same arc": function() {
      var topology = topojson.topology({
        ab: {type: "LineString", coordinates: [[0, 0], [0, 1]]},
        ba: {type: "LineString", coordinates: [[0, 1], [0, 0]]}
      });
      assert.deepEqual(topology.objects.ab, {type: "LineString", arcs: [0]});
      assert.deepEqual(topology.objects.ba, {type: "LineString", arcs: [~0]});
    },

    //
    // A
    //  \
    //   \
    //    \
    //     \
    //      \
    // B-----C-----D
    //
    "the lines ACD and BCD share three arcs": function() {
      var topology = topojson.topology({
        acd: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1]]},
        bcd: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1]]}
      });
      assert.deepEqual(topology.objects.acd, {type: "LineString", arcs: [0, 1]});
      assert.deepEqual(topology.objects.bcd, {type: "LineString", arcs: [2, 1]});
    },

    //
    // A
    //  \
    //   \
    //    \
    //     \
    //      \
    // B-----C-----D
    //
    "the lines ACD and DCB share three arcs": function() {
      var topology = topojson.topology({
        acd: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1]]},
        dcb: {type: "LineString", coordinates: [[2, 1], [1, 1], [0, 1]]}
      }, {quantization: 3});
      assert.deepEqual(topology.arcs, [
        [[0, 0], [1, 2]], // AC
        [[1, 2], [1, 0]], // CD
        [[1, 2], [-1, 0]], // CB
      ]);
      assert.deepEqual(topology.objects.acd, {type: "LineString", arcs: [0, 1]});
      assert.deepEqual(topology.objects.dcb, {type: "LineString", arcs: [~1, 2]});
    },

    //
    // A                 E
    //  \               /
    //   \             /
    //    \           /
    //     \         /
    //      \       /
    // B-----C-----D-----F
    //
    "the lines ACDE, ACDF, BCDE and BCDF and their reversals share five arcs": function() {
      var topology = topojson.topology({
        acde: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 0]]},
        acdf: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 1]]},
        bcde: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1], [3, 0]]},
        bcdf: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1], [3, 1]]},
        edca: {type: "LineString", coordinates: [[3, 0], [2, 1], [1, 1], [0, 0]]},
        fdca: {type: "LineString", coordinates: [[3, 1], [2, 1], [1, 1], [0, 0]]},
        edcb: {type: "LineString", coordinates: [[3, 0], [2, 1], [1, 1], [0, 1]]},
        fdcb: {type: "LineString", coordinates: [[3, 1], [2, 1], [1, 1], [0, 1]]}
      }, {quantization: 4});
      assert.deepEqual(topology.arcs, [
        [[0, 0], [1, 3]], // AC
        [[1, 3], [1, 0]], // CD
        [[2, 3], [1, -3]], // DE
        [[2, 3], [1, 0]], // DF
        [[0, 3], [1, 0]] // BC
      ]);
      assert.deepEqual(topology.objects.acde, {type: "LineString", arcs: [0, 1, 2]});
      assert.deepEqual(topology.objects.acdf, {type: "LineString", arcs: [0, 1, 3]});
      assert.deepEqual(topology.objects.bcde, {type: "LineString", arcs: [4, 1, 2]});
      assert.deepEqual(topology.objects.bcdf, {type: "LineString", arcs: [4, 1, 3]});
      assert.deepEqual(topology.objects.edca, {type: "LineString", arcs: [~2, ~1, ~0]});
      assert.deepEqual(topology.objects.fdca, {type: "LineString", arcs: [~3, ~1, ~0]});
      assert.deepEqual(topology.objects.edcb, {type: "LineString", arcs: [~2, ~1, ~4]});
      assert.deepEqual(topology.objects.fdcb, {type: "LineString", arcs: [~3, ~1, ~4]});
    },

    //
    // A-----B-----E
    // |     |     |
    // |     |     |
    // |     |     |
    // |     |     |
    // |     |     |
    // D-----C-----F
    //
    "the polygons ABCDA and BEFCB share three arcs": function() {
      var topology = topojson.topology({
        abcda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
        befcb: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]]}
      }, {quantization: 3});
      assert.deepEqual(topology.arcs, [
        [[1, 0], [0, 2]], // BC
        [[1, 2], [-1, 0], [0, -2], [1, 0]], // CDAB
        [[1, 0], [1, 0], [0, 2], [-1, 0]] // BEFC
      ]);
      assert.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0, 1]]});
      assert.deepEqual(topology.objects.befcb, {type: "Polygon", arcs: [[~0, 2]]});
    },

    //
    // A-----B
    // |\    |\
    // | \   | \
    // |  \  |  \
    // |   \ |   \
    // |    \|    \
    // D-----C-----F
    //
    "the polygons ABCA, ACDA and BFCB share five arcs": function() {
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
      assert.deepEqual(topology.objects.abca, {type: "Polygon", arcs: [[0, 1, 2]]});
      assert.deepEqual(topology.objects.acda, {type: "Polygon", arcs: [[3, ~0]]});
      assert.deepEqual(topology.objects.bfcb, {type: "Polygon", arcs: [[~2, 4]]});
    },

    //
    // A-----B-----E
    //  \    |     |\
    //   \   |     | \
    //    \  |     |  \
    //     \ |     |   \
    //      \|     |    \
    //       C-----F-----G
    //
    "the polygons ABCA, BEFCB and EGFE share six arcs": function() {
      var topology = topojson.topology({
        abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]},
        befcb: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]]},
        egfe: {type: "Polygon", coordinates: [[[2, 0], [3, 1], [2, 1], [2, 0]]]}
      }, {quantization: 4});
      assert.deepEqual(topology.arcs, [
        [[1, 0], [0, 3]], // BC
        [[1, 3], [-1, -3], [1, 0]], // CAB
        [[1, 0], [1, 0]], // BE
        [[2, 0], [0, 3]], // EF
        [[2, 3], [-1, 0]], // FC
        [[2, 0], [1, 3], [-1, 0]] // EGF
      ]);
      assert.deepEqual(topology.objects.abca, {type: "Polygon", arcs: [[0, 1]]});
      assert.deepEqual(topology.objects.befcb, {type: "Polygon", arcs: [[2, 3, 4, ~0]]});
      assert.deepEqual(topology.objects.egfe, {type: "Polygon", arcs: [[~3, 5]]});
    },

    //
    // A-----B-----E
    // |     |     |
    // |     |     |
    // D-----C     |
    // |           |
    // |           |
    // G-----------F
    //
    "the polygons ABCDA, ABEFGDA and BEFGDCB share three arcs": function() {
      var topology = topojson.topology({
        abcda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
        abefgda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [2, 2], [0, 2], [0, 1], [0, 0]]]},
        befgdcb: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [2, 2], [0, 2], [0, 1], [1, 1], [1, 0]]]}
      }, {quantization: 3});
      assert.deepEqual(topology.arcs, [
        [[1, 0], [0, 1], [-1, 0]], // BCD
        [[0, 1], [0, -1], [1, 0]], // DAB
        [[1, 0], [1, 0], [0, 2], [-2, 0], [0, -1]] // BEFGD
      ]);
      assert.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0, 1]]});
      assert.deepEqual(topology.objects.abefgda, {type: "Polygon", arcs: [[2, 1]]});
      assert.deepEqual(topology.objects.befgdcb, {type: "Polygon", arcs: [[~0, 2]]});
    }
  }
});

suite.export(module);
