var vows = require("vows"),
    assert = require("assert"),
    hashset = require("../../lib/topojson/topology/hashset");

var suite = vows.describe("hashset");

suite.addBatch({
  "hashset": {
    "can add an object": function() {
      var map = hashset(10, hash, equals),
          key = {hash: 1};
      assert.isTrue(map.add(key));
      assert.isTrue(map.has(key));
    },
    "has returns false when no key is found": function() {
      var map = hashset(10, hash, equals),
          key = {hash: 1};
      assert.isFalse(map.has(key));
    },
    "when a hash collision occurs, get checks that the keys are equal": function() {
      var map = hashset(10, hash, equals),
          keyA = {hash: 1},
          keyB = {hash: 1},
          keyC = {hash: 1};
      assert.isTrue(map.add(keyA));
      assert.isTrue(map.add(keyB));
      assert.isTrue(map.has(keyA));
      assert.isTrue(map.has(keyB));
      assert.isFalse(map.has(keyC));
    },
    "add returns true": function() {
      var map = hashset(10, hash, equals),
          key = {hash: 1};
      assert.isTrue(map.add(key));
    },
    "add throws an error when full": function() {
      var map = hashset(0, hash, equals), // minimum size of 16
          keys = [];
      for (var i = 0; i < 16; ++i) map.add(keys[i] = {hash: i});
      for (var i = 0; i < 16; ++i) map.add(keys[i]); // replacing is okay
      assert.throws(function() { map.add({hash: 16}); });
    },
    "the hash function must return a nonnegative integer, but can be greater than size": function() {
      var map = hashset(10, hash, equals),
          key = {hash: 11};
      assert.isFalse(map.has(key));
      assert.isTrue(map.add(key));
      assert.isTrue(map.has(key));
    }
  }
});

function hash(o) {
  return o.hash;
}

function equals(a, b) {
  return a === b;
}

suite.export(module);
