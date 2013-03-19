exports.name = "cartesian";

exports.formatDistance = function(d) {
  return d.toPrecision(3);
};

exports.area = function(t) {
  return Math.abs((t[0][0] - t[2][0]) * (t[1][1] - t[0][1]) - (t[0][0] - t[1][0]) * (t[2][1] - t[0][1]));
};

exports.distance = function(a, b) {
  var dx = a[0] - b[0],
      dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
};
