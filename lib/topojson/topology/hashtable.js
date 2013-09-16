module.exports = function(size, hash, equal) {
  var hashtable = new Array(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
      mask = size - 1,
      free = size;

  function set(key, value) {
    var index = hash(key) & mask,
        match = hashtable[index],
        collisions = 0;
    while (match != null) {
      if (equal(match.key, key)) return match.value = value;
      match = hashtable[index = (index + 1) & mask];
      if (++collisions >= size) throw new Error("full hashtable");
    }
    hashtable[index] = {key: key, value: value};
    --free;
    return value;
  }

  function get(key, missingValue) {
    var index = hash(key) & mask,
        match = hashtable[index],
        collisions = 0;
    while (match != null) {
      if (equal(match.key, key)) return match.value;
      match = hashtable[index = (index + 1) & mask];
      if (++collisions >= size) break;
    }
    return missingValue;
  }

  function remove(key) {
    var index = hash(key) & mask,
        match = hashtable[index],
        collisions = 0;
    while (match != null) {
      if (equal(match.key, key)) {
        hashtable[index] = null;
        match = hashtable[index = (index + 1) & mask];
        if (match != null) { // delete and re-add
          ++free;
          hashtable[index] = null;
          set(match.key, match.value);
        }
        ++free;
        return true;
      }
      match = hashtable[index = (index + 1) & mask];
      if (++collisions >= size) break;
    }
    return false;
  }

  function keys() {
    var keys = [];
    for (var i = 0, n = hashtable.length; i < n; ++i) {
      var match = hashtable[i];
      if (match != null) keys.push(match.key);
    }
    return keys;
  }

  return {
    set: set,
    get: get,
    remove: remove,
    keys: keys
  };
};
