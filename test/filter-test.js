var vows = require("vows"),
    assert = require("assert"),
    topojson = require("../");

var suite = vows.describe("topojson.filter");

suite.addBatch({
  "filter": {
    topic: function() {
      return topojson.filter;
    },
    "null top-level geometry objects are preserved": function(filter) {
      var topology = topojson.topology({
        feature: {type: "Feature", geometry: null},
        geometry: null
      });
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.feature, {type: null});
      assert.deepEqual(topology.objects.geometry, {type: null});
    },
    "empty top-level feature collections are converted to null": function(filter) {
      var topology = topojson.topology({
        collection: {type: "FeatureCollection", features: [
          {type: "Feature", properties: {}, geometry: null},
          {type: "Feature", properties: {}, geometry: null}
        ]}
      });
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.collection, {type: null});
    },
    "null inner features are removed": function(filter) {
      var topology = topojson.topology({
        collection: {type: "FeatureCollection", features: [
          {type: "Feature", properties: {}, geometry: null},
          {type: "Feature", properties: {}, geometry: {type: "Point", coordinates: [0, 0]}},
          {type: "Feature", properties: {}, geometry: null}
        ]}
      });
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [{type: "Point", coordinates: [0, 0]}]});
    },
    "empty polygons are removed": function(filter) {
      var topology = topojson.topology({
        collection: {type: "FeatureCollection", features: [
          {type: "Feature", properties: {}, geometry: null},
          {type: "Feature", properties: {}, geometry: {type: "Point", coordinates: [0, 0]}},
          {type: "Feature", properties: {}, geometry: {type: "Polygon", coordinates: [[[0, 0], [1, 1], [1, 1], [0, 0]]]}},
          {type: "Feature", properties: {}, geometry: null}
        ]}
      });
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [{type: "Point", coordinates: [0, 0]}]});
    },
    "empty rings are removed": function(filter) {
      var topology = topojson.topology({
        collection: {type: "GeometryCollection", geometries: [
          {type: "Polygon", coordinates: [[[0, 0], [1, 1], [1, 1], [0, 0]], [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
          {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], [[0, 0], [1, 1], [1, 1], [0, 0]]]}
        ]}
      });
      filter(topology, {"coordinate-system": "spherical", "preserve-attached": false});
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [
        {type: "Polygon", arcs: [[~0, ~1]]},
        {type: "Polygon", arcs: [[~0, ~1]]}
      ]});
    },
    "large interior rings (holes) are preserved": function(filter) {
      var topology = topojson.topology({
        collection: {type: "GeometryCollection", geometries: [
          {type: "Polygon", coordinates: [
            [[0, 0], [0, 20], [20, 20], [20, 0], [0, 0]], // area ~0.12
            [[5, 5], [15, 5], [15, 15], [5, 15], [5, 5]] // area ~0.03
          ]}
        ]}
      });
      filter(topology, {"coordinate-system": "spherical", "minimum-area": 0.01});
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [
        {type: "Polygon", arcs: [[0], [1]]}
      ]});
    },
    "small interior rings (holes) are removed": function(filter) {
      var topology = topojson.topology({
        collection: {type: "GeometryCollection", geometries: [
          {type: "Polygon", coordinates: [
            [[0, 0], [0, 20], [20, 20], [20, 0], [0, 0]], // area ~0.12
            [[5, 5], [15, 5], [15, 15], [5, 15], [5, 5]] // area ~0.03
          ]}
        ]}
      });
      filter(topology, {"coordinate-system": "spherical", "minimum-area": 0.1});
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [
        {type: "Polygon", arcs: [[0]]}
      ]});
    },
    "small exterior rings with large interior rings are removed": function(filter) {
      var topology = topojson.topology({
        collection: {type: "GeometryCollection", geometries: [
          {type: "Polygon", coordinates: [
            [[0, 0], [0, 20], [20, 20], [20, 0], [0, 0]], // area ~0.12
            [[5, 5], [5, 15], [15, 15], [15, 5], [5, 5]] // clockwise! area ~12.54
          ]}
        ]}
      });
      filter(topology, {"coordinate-system": "spherical", "minimum-area": 0.2});
      assert.deepEqual(topology.objects.collection, {type: null});
    },
    "very large exterior rings are preserved": function(filter) {
      var topology = topojson.topology({
        collection: {type: "GeometryCollection", geometries: [
          {type: "Polygon", coordinates: [
            [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]] // area ~12.45
          ]}
        ]}
      });
      filter(topology, {"coordinate-system": "spherical", "minimum-area": 0.01, "force-clockwise": false});
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [
        {type: "Polygon", arcs: [[0]]}
      ]});
    },
    "small exterior rings attached to other rings are preserved": function(filter) {
      var topology = topojson.topology({
        collection: {type: "GeometryCollection", geometries: [
          {type: "MultiPolygon", coordinates: [
            [[[2, 0], [2, 1], [3, 1], [3, 0], [2, 0]]], // area 1, detached
            [[[4, 0], [4, 1], [5, 1], [5, 0], [4, 0]]], // area 1, detached
            [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]], // area 1, attached
            [[[0, 1], [0, 2], [1, 2], [1, 1], [0, 1]]] // area 1, attached
          ]}
        ]}
      });
      filter(topology, {"coordinate-system": "cartesian", "minimum-area": 2});
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [
        {type: "MultiPolygon", arcs: [
          [[-1, -2]],
          [[1, -3]]
        ]}
      ]});
    },
    "zero-area exterior rings coincident with other rings are removed": function(filter) {
      var topology = topojson.topology({
        collection: {type: "GeometryCollection", geometries: [
          {type: "MultiPolygon", coordinates: [
            [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]], // area 1
            [[[0, 0], [0, 0], [0, 0], [0, 0]]], // area 0
            [[[1, 0], [1, 0], [1, 0], [1, 0]]], // area 0
            [[[0, 1], [0, 1], [0, 1], [0, 1]]], // area 0
            [[[1, 1], [1, 1], [1, 1], [1, 1]]] // area 0
          ]}
        ]}
      });
      filter(topology, {"coordinate-system": "cartesian", "minimum-area": .5});
      assert.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [
        {type: "MultiPolygon", arcs: [
          [[-1, -2, -3, -4]]
        ]}
      ]});
    },
    "polygons with no rings are removed": function(filter) {
      var topology = {
        objects: {
          collection: {type: "GeometryCollection", geometries: [
            {type: "Polygon", arcs: []}
          ]}
        },
        arcs: []
      };
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.collection, {type: null});
    },
    "empty top-level geometry objects are converted to null": function(filter) {
      var topology = topojson.topology({line: {type: "Polygon", coordinates: [[[0, 0], [1, 1], [1, 1], [0, 0]]]}});
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.line, {type: null});
    },
    "non-empty top-level geometry objects are preserved": function(filter) {
      var topology = topojson.topology({polygon: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]}});
      filter(topology, {"coordinate-system": "spherical"});
      assert.deepEqual(topology.objects.polygon, {type: "Polygon", arcs: [[0]]});
    }
  }
});

suite.export(module);
