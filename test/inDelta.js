var tape = require("tape");

tape.Test.prototype.inDelta = function(actual, expected, delta, message) {
  if (arguments.length < 3) delta = 1e-6;
  this._assert(inDelta(actual, expected, delta), {
    message: "should be in delta",
    operator: "inDelta",
    actual: actual,
    expected: expected
  });
};

function inDelta(actual, expected, delta) {
  if (Array.isArray(expected)) return Array.isArray(actual) && inDeltaArray(actual, expected, delta);
  if (typeof expected === "number") return typeof actual === "number" && inDeltaNumber(actual, expected, delta);
  if (typeof expected === "object") return typeof actual === "object" && inDeltaObject(actual, expected, delta);
  return actual == expected;
}

function inDeltaObject(actual, expected, delta) {
  for (var key in expected) {
    if (!(key in actual) || !inDelta(actual[key], expected[key], delta)) {
      return false;
    }
  }
  for (var key in actual) {
    if (!(key in expected)) {
      return false;
    }
  }
  return true;
}

function inDeltaArray(actual, expected, delta) {
  var n = expected.length, i = -1;
  if (actual.length !== n) return false;
  while (++i < n) if (!inDelta(actual[i], expected[i], delta)) return false;
  return true;
}

function inDeltaNumber(actual, expected, delta) {
  return actual >= expected - delta && actual <= expected + delta;
}
