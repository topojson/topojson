var type = require("./type");

// Ensure a canonical representation for points:
// * if abs(φ) < 90°, then -180° ≤ λ < 180°,
// * if abs(φ) = 90°, then λ = 0°.
module.exports = function(objects, options) {
  var normalize = type({
    point: function(coordinates) {
      if (Math.abs(Math.abs(coordinates[1]) - 90) < 1e-6) {
        coordinates[0] = 0;
        coordinates[1] = coordinates[1] > 0 ? 90 : -90;
      } else {
        coordinates[0] = (coordinates[0] + 180) % 360 - 180;
      }
    }
  });

  for (var key in objects) {
    normalize.object(objects[key]);
  }
};
