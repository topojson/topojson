var vows = require("vows"),
    assert = require("assert"),
    mergeProperties = require("../lib/topojson/merge-properties");

var suite = vows.describe("merge-properties");

suite.addBatch({
  "merge-properties": {

    "when no objects are merged, does not define the properties object": function() {
      var properties = mergeProperties();
      assert.deepEqual(properties.apply({}), {});
    },

    "when only empty properties are merged, does not define the properties object": function() {
      var properties = mergeProperties();
      properties.merge({properties: null});
      properties.merge({properties: undefined});
      properties.merge({});
      assert.deepEqual(properties.apply({}), {});
    },

    "when only inconsistent properties are merged, does not define the properties object": function() {
      var properties = mergeProperties();
      properties.merge({properties: {a: 1}});
      properties.merge({properties: {b: 1}});
      assert.deepEqual(properties.apply({}), {});
    },

    "only consistent properties are merged": function() {
      var properties = mergeProperties();
      properties.merge({properties: {a: 1, c: 2}});
      properties.merge({properties: {b: 1, c: 2}});
      assert.deepEqual(properties.apply({}), {properties: {c: 2}});
    },

    "merging with empty properties clears any previously-merged properties": function() {
      var properties = mergeProperties();
      properties.merge({properties: {a: 1, c: 2}});
      properties.merge({properties: {b: 1, c: 2}});
      properties.merge({properties: {}});
      assert.deepEqual(properties.apply({}), {});
    },

    "merging with null properties clears any previously-merged properties": function() {
      var properties = mergeProperties();
      properties.merge({properties: {a: 1, c: 2}});
      properties.merge({properties: {b: 1, c: 2}});
      properties.merge({properties: null});
      assert.deepEqual(properties.apply({}), {});
    },

    "merging with undefined properties clears any previously-merged properties": function() {
      var properties = mergeProperties();
      properties.merge({properties: {a: 1, c: 2}});
      properties.merge({properties: {b: 1, c: 2}});
      properties.merge({});
      assert.deepEqual(properties.apply({}), {});
    },

    "overwrites the object’s properties": function() {
      var properties = mergeProperties();
      properties.merge({properties: {b: 2}});
      assert.deepEqual(properties.apply({properties: {a: 1}}), {properties: {b: 2}});
    },

    "if the merged properties are empty, deletes the object’s properties": function() {
      var properties = mergeProperties();
      assert.deepEqual(properties.apply({properties: {a: 1}}), {});
    }
  }
});

suite.export(module);
