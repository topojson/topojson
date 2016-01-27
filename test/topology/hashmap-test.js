var tape = require("tape"),
    hashmap = require("../../lib/topojson/topology/hashmap");

tape("hashmap can get an object by key", function(test) {
  var map = hashmap(10, hash, equals),
      key = {hash: 1};
  map.set(key, 42);
  test.equal(map.get(key), 42);
  test.end();
});

tape("hashmap get returns undefined when no key is found", function(test) {
  var map = hashmap(10, hash, equals),
      key = {hash: 1};
  test.equal(map.get(key), undefined);
  test.end();
});

tape("hashmap get returns the missing value when no key is found", function(test) {
  var map = hashmap(10, hash, equals),
      key = {hash: 1};
  test.equal(map.get(key, 42), 42);
  test.end();
});

tape("hashmap when a hash collision occurs, get checks that the keys are equal", function(test) {
  var map = hashmap(10, hash, equals),
      keyA = {hash: 1},
      keyB = {hash: 1},
      keyC = {hash: 1};
  map.set(keyA, "A");
  map.set(keyB, "B");
  test.equal(map.get(keyA), "A");
  test.equal(map.get(keyB), "B");
  test.equal(map.get(keyC), undefined);
  test.end();
});

tape("hashmap can set an object by key", function(test) {
  var map = hashmap(10, hash, equals),
      key = {hash: 1};
  map.set(key, 42);
  test.equal(map.get(key), 42);
  test.end();
});

tape("hashmap can set an object by key if not already set", function(test) {
  var map = hashmap(10, hash, equals),
      key = {hash: 1};
  test.equal(map.maybeSet(key, 42), 42);
  test.equal(map.get(key), 42);
  test.equal(map.maybeSet(key, 43), 42);
  test.equal(map.get(key), 42);
  test.end();
});

tape("hashmap set returns the set value", function(test) {
  var map = hashmap(10, hash, equals),
      key = {hash: 1};
  test.equal(map.set(key, 42), 42);
  test.end();
});

tape("hashmap set throws an error when full", function(test) {
  var map = hashmap(0, hash, equals), // minimum size of 16
      keys = [];
  for (var i = 0; i < 16; ++i) map.set(keys[i] = {hash: i}, true);
  for (var i = 0; i < 16; ++i) map.set(keys[i], true); // replacing is okay
  test.throws(function() { map.set({hash: 16}, true); });
  test.end();
});

tape("hashmap when a hash collision occurs, set checks that the keys are equal", function(test) {
  var map = hashmap(10, hash, equals),
      keyA = {hash: 1},
      keyB = {hash: 1},
      keyC = {hash: 1};
  test.equal(map.set(keyA, "A"), "A");
  test.equal(map.set(keyB, "B"), "B");
  test.equal(map.get(keyA), "A");
  test.equal(map.get(keyB), "B");
  test.equal(map.get(keyC), undefined);
  test.end();
});

tape("hashmap the hash function must return a nonnegative integer, but can be greater than size", function(test) {
  var map = hashmap(10, hash, equals),
      key = {hash: 11};
  test.equal(map.get(key), undefined);
  test.equal(map.set(key, 42), 42);
  test.equal(map.get(key), 42);
  test.end();
});


function hash(o) {
  return o.hash;
}

function equals(a, b) {
  return a === b;
}
