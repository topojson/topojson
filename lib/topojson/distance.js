var radians = Math.PI / 180;

module.exports = function(x0, y0, x1, y1) {
  x0 *= radians, y0 *= radians, x1 *= radians, y1 *= radians;
  return 2 * Math.asin(Math.sqrt(haversin(y1 - y0) + Math.cos(y0) * Math.cos(y1) * haversin(x1 - x0)));
};

function haversin(x) {
  return (x = Math.sin(x / 2)) * x;
}
