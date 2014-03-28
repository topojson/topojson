var vows = require("vows"),
    assert = require("assert"),
    stitch = require("../lib/topojson/stitch");

var suite = vows.describe("stitch");

suite.addBatch({
  "stitch": {
    "simple polygon cut along the antimeridian": function() {
      var o = {type: "MultiPolygon", coordinates: [
        [[[-179, 1], [-179, 0], [-180, 0], [-180, 1], [-179, 1]]],
        [[[180, 0], [179, 0], [179, 1], [180, 1], [180, 0]]]
      ]};
      stitch({foo: o});
      assert.deepEqual(array(o.coordinates), [[
        [[180, 0], [179, 0], [179, 1], [-180, 1], [-179, 1], [-179, 0], [180, 0]]
      ]]);
    },
    "ring polygon with hole cut along the antimeridian": function() {
      var o = {type: "MultiPolygon", coordinates: [
        [[[-180, 1], [-180, 2], [-170, 2], [-170, -2], [-180, -2], [-180, -1], [-179, -1], [-179, 1], [-180, 1]]],
        [[[180, 1], [179, 1], [179, -1], [180, -1], [180, -2], [170, -2], [170, 2], [180, 2], [180, 1]]]
      ]};
      stitch({foo: o});
      assert.deepEqual(array(o.coordinates), [[
        [[-180, -2], [170, -2], [170, 2], [-180, 2], [-170, 2], [-170, -2], [-180, -2]],
        [[180, 1], [179, 1], [179, -1], [-180, -1], [-179, -1], [-179, 1], [180, 1]]
      ]]);
    },
    "ring polygon cut along the antimeridian (not through hole)": function() {
      var o = {type: "MultiPolygon", coordinates: [
        [[[-170, 10], [-170, 0], [-180, 0], [-180, 10], [-170, 10]], [[-179, 1], [-178, 1], [-178, 2], [-179, 2], [-179, 1]]],
        [[[180, 0], [170, 0], [170, 10], [180, 10], [180, 0]]]
      ]};
      stitch({foo: o});
      assert.deepEqual(array(o.coordinates), [[
        [[180, 0], [170, 0], [170, 10], [-180, 10], [-170, 10], [-170, 0], [180, 0]],
        [[-179, 1], [-178, 1], [-178, 2], [-179, 2], [-179, 1]]
      ]]);
    },
    "polar polygon cut along the antimeridian": function() {
      var o = {type: "Polygon", coordinates: [
        [[180, 60], [120, 60], [60, 60], [-60, 60], [-120, 60], [-180, 60], [-180, 90], [-120, 90], [-60, 90], [60, 90], [120, 90], [180, 90], [180, 60]]
      ]};
      stitch({foo: o});
      assert.deepEqual(array(o.coordinates), [
        [[180, 60], [120, 60], [60, 60], [-60, 60], [-120, 60], [180, 60]]
      ]);
    },
    "polar polygon cut along the antimeridian, with a hole": function() {
      var o = {type: "Polygon", coordinates: [
        [[180, 60], [120, 60], [60, 60], [-60, 60], [-120, 60], [-180, 60], [-180, 90], [-120, 90], [-60, 90], [60, 90], [120, 90], [180, 90], [180, 60]],
        [[0, 80], [1, 80], [1, 81], [0, 81], [0, 80]]
      ]};
      stitch({foo: o});
      assert.deepEqual(array(o.coordinates), [
        [[180, 60], [120, 60], [60, 60], [-60, 60], [-120, 60], [180, 60]],
        [[0, 80], [1, 80], [1, 81], [0, 81], [0, 80]]
      ]);
    }
  }
});

suite.export(module);

// Converts arrays with additional properties to pure arrays with no additional
// properties, for use with assert.deepEqual.
function array(d) {
  return Array.isArray(d) ? d.map(array) : d;
}
