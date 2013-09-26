var type = require("./type");

module.exports = function(objects, options) {
  var wrap = type({
    point: function(coordinates) {
      if (Math.abs(Math.abs(coordinates[1]) - 90) < 1e-6) {
        coordinates[0] = 0;
        coordinates[1] = coordinates[1] > 0 ? 90 : -90;
      } else {
        coordinates[0] = Math.abs(Math.abs(coordinates[0]) - 180) < 1e-6
            ? -180 : (coordinates[0] + 180) % 360 - 180;
      }
    }
  });

  for (var key in objects) {
    wrap.object(objects[key]);
  }
};
