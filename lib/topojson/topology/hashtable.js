module.exports = function(size, hash, equal) {
  var hashtable = new Array(size = 1 << Math.ceil(Math.log(size + 1) / Math.LN2)),
      mask = size - 1;

  function set(key, value) {
    var index = hash(key) & mask,
        match = hashtable[index];
    while (match != null) {
      if (equal(match.key, key)) return match.value = value;
      match = hashtable[index = (index + 1) & mask];
    }
    hashtable[index] = {key: key, value: value};
    return value;
  }

  function get(key, missingValue) {
    var index = hash(key) & mask,
        match = hashtable[index];
    while (match != null) {
      if (equal(match.key, key)) return match.value;
      match = hashtable[index = (index + 1) & mask];
    }
    return missingValue;
  }

  function remove(key) {
    var index = hash(key) & mask,
        match = hashtable[index];
    while (match != null) {
      if (equal(match.key, key)) {
        hashtable[index] = null;
        match = hashtable[index = (index + 1) & mask];
        if (match != null) { // delete and re-add
          hashtable[index] = null;
          set(match.key, match.value);
        }
        return true;
      }
      match = hashtable[index = (index + 1) & mask];
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
