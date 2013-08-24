module.exports = function(size, hash, equal) {
  var hashtable = new Array(size);
  return {
    set: function(key, value) {
      var index = hash(key) % size,
          matches = hashtable[index];

      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.key, key)) {
            return match.value = value;
          }
        }
      } else {
        matches = hashtable[index] = [];
      }

      matches.push(match = {key: key, value: value});
      return value;
    },
    get: function(key, missingValue) {
      var matches = hashtable[hash(key) % size];
      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.key, key)) {
            return match.value;
          }
        }
      }
      return missingValue;
    },
    remove: function(key) {
      var matches = hashtable[hash(key) % size];
      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.key, key)) {
            matches.splice(i, 1);
            return true;
          }
        }
      }
      return false;
    }
  };
};
