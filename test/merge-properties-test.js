var tape = require("tape"),
    mergeProperties = require("../lib/topojson/merge-properties");

tape("merge-properties when no objects are merged, does not define the properties object", function(test) {
  var properties = mergeProperties();
  test.deepEqual(properties.apply({}), {});
  test.end();
});

tape("merge-properties when only empty properties are merged, does not define the properties object", function(test) {
  var properties = mergeProperties();
  properties.merge({properties: null});
  properties.merge({properties: undefined});
  properties.merge({});
  test.deepEqual(properties.apply({}), {});
  test.end();
});

tape("merge-properties when only inconsistent properties are merged, does not define the properties object", function(test) {
  var properties = mergeProperties();
  properties.merge({properties: {a: 1}});
  properties.merge({properties: {b: 1}});
  test.deepEqual(properties.apply({}), {});
  test.end();
});

tape("merge-properties only consistent properties are merged", function(test) {
  var properties = mergeProperties();
  properties.merge({properties: {a: 1, c: 2}});
  properties.merge({properties: {b: 1, c: 2}});
  test.deepEqual(properties.apply({}), {properties: {c: 2}});
  test.end();
});

tape("merge-properties merging with empty properties clears any previously-merged properties", function(test) {
  var properties = mergeProperties();
  properties.merge({properties: {a: 1, c: 2}});
  properties.merge({properties: {b: 1, c: 2}});
  properties.merge({properties: {}});
  test.deepEqual(properties.apply({}), {});
  test.end();
});

tape("merge-properties merging with null properties clears any previously-merged properties", function(test) {
  var properties = mergeProperties();
  properties.merge({properties: {a: 1, c: 2}});
  properties.merge({properties: {b: 1, c: 2}});
  properties.merge({properties: null});
  test.deepEqual(properties.apply({}), {});
  test.end();
});

tape("merge-properties merging with undefined properties clears any previously-merged properties", function(test) {
  var properties = mergeProperties();
  properties.merge({properties: {a: 1, c: 2}});
  properties.merge({properties: {b: 1, c: 2}});
  properties.merge({});
  test.deepEqual(properties.apply({}), {});
  test.end();
});

tape("merge-properties overwrites the object’s properties", function(test) {
  var properties = mergeProperties();
  properties.merge({properties: {b: 2}});
  test.deepEqual(properties.apply({properties: {a: 1}}), {properties: {b: 2}});
  test.end();
});

tape("merge-properties if the merged properties are empty, deletes the object’s properties", function(test) {
  var properties = mergeProperties();
  test.deepEqual(properties.apply({properties: {a: 1}}), {});
  test.end();
});
