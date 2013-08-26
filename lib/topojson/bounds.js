var d3 = require("d3");

// Computes the bounding box of the specified hash of GeoJSON objects.
module.exports = function(objects) {
  var x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;

  var bound = {
    lineStart: noop,
    lineEnd: noop,
    polygonStart: noop,
    polygonEnd: noop,
    point: function(x, y) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  };

  for (var key in objects) {
    d3.geo.stream(objects[key], bound);
  }

  return [x0, y0, x1, y1];
};

function noop() {}
