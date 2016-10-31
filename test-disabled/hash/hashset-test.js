var tape = require("tape"),
    hashset = require("../../lib/topojson/topology/hashset");

tape("hashset can add an object", function(test) {
  var map = hashset(10, hash, equals),
      key = {hash: 1};
  test.equal(map.add(key), true);
  test.equal(map.has(key), true);
  test.end();
});

tape("hashset has returns false when no key is found", function(test) {
  var map = hashset(10, hash, equals),
      key = {hash: 1};
  test.equal(map.has(key), false);
  test.end();
});

tape("hashset when a hash collision occurs, get checks that the keys are equal", function(test) {
  var map = hashset(10, hash, equals),
      keyA = {hash: 1},
      keyB = {hash: 1},
      keyC = {hash: 1};
  test.equal(map.add(keyA), true);
  test.equal(map.add(keyB), true);
  test.equal(map.has(keyA), true);
  test.equal(map.has(keyB), true);
  test.equal(map.has(keyC), false);
  test.end();
});

tape("hashset add returns true", function(test) {
  var map = hashset(10, hash, equals),
      key = {hash: 1};
  test.equal(map.add(key), true);
  test.end();
});

tape("hashset add throws an error when full", function(test) {
  var map = hashset(0, hash, equals), // minimum size of 16
      keys = [];
  for (var i = 0; i < 16; ++i) map.add(keys[i] = {hash: i});
  for (var i = 0; i < 16; ++i) map.add(keys[i]); // replacing is okay
  test.throws(function() { map.add({hash: 16}); }, /Error/);
  test.end();
});

tape("hashset the hash function must return a nonnegative integer, but can be greater than size", function(test) {
  var map = hashset(10, hash, equals),
      key = {hash: 11};
  test.equal(map.has(key), false);
  test.equal(map.add(key), true);
  test.equal(map.has(key), true);
  test.end();
});

function hash(o) {
  return o.hash;
}

function equals(a, b) {
  return a === b;
}
