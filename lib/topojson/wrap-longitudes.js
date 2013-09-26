var type = require("./type");

module.exports = function(objects, options) {
  var wrap = type({
    point: function(coordinates) {
      coordinates[0] = Math.abs(coordinates[1]) === 90 ? 0 : (coordinates[0] + 180) % 360 - 180;
    }
  });

  for (var key in objects) {
    wrap.object(objects[key]);
  }
};
