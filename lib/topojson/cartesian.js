exports.name = "cartesian";
exports.formatDistance = formatDistance;
exports.ringArea = ringArea;
exports.lineLength = lineLength;
exports.absoluteArea = Math.abs;
exports.triangleArea = triangleArea;
exports.distance = distance;

function formatDistance(d) {
  return d.toString();
}

function ringArea(ring) {
  var i = 0,
      n = ring.length,
      area = ring[n - 1][1] * ring[0][0] - ring[n - 1][0] * ring[0][1];
  while (++i < n) {
    area += ring[i - 1][1] * ring[i][0] - ring[i - 1][0] * ring[i][1];
  }
  return -area * .5; // ensure clockwise pixel areas are positive
}

function lineLength(line) {
  var i = 0,
      n = line.length,
      p = line[0],
      x0 = p[0],
      y0 = p[1],
      x1,
      y1,
      dx,
      dy,
      length = 0;
  while (++i < n) {
    p = line[i], x1 = p[0], y1 = p[1], dx = x1 - x0, dy = y1 - y0;
    length += Math.sqrt(dx * dx + dy * dy);
    x0 = x1, y0 = y1;
  }
  return length;
}

function triangleArea(triangle) {
  return Math.abs(
    (triangle[0][0] - triangle[2][0]) * (triangle[1][1] - triangle[0][1])
    - (triangle[0][0] - triangle[1][0]) * (triangle[2][1] - triangle[0][1])
  );
}

function distance(x0, y0, x1, y1) {
  var dx = x0 - x1, dy = y0 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
