var minHeap = require("./min-heap");

module.exports = function(topology, minArea) {
  var heap = minHeap(),
      maxArea = 0,
      triangle;

  topology.coordinates.forEach(function(lineString) {
    var points = lineString, // TODO projection
        triangles = [];

    for (var i = 1, n = lineString.length - 1; i < n; ++i) {
      triangle = points.slice(i - 1, i + 2);
      if (triangle[1].area = area(triangle)) {
        triangles.push(triangle);
        heap.push(triangle);
      }
    }

    for (var i = 0, n = triangles.length; i < n; ++i) {
      triangle = triangles[i];
      triangle.previous = triangles[i - 1];
      triangle.next = triangles[i + 1];
    }

    return points;
  });

  while (triangle = heap.pop()) {

    // If the area of the current point is less than that of the previous point
    // to be eliminated, use the latter's area instead. This ensures that the
    // current point cannot be eliminated without eliminating previously-
    // eliminated points.
    if (triangle[1].area < maxArea) triangle[1].area = maxArea;
    else maxArea = triangle[1].area;

    if (triangle.previous) {
      triangle.previous.next = triangle.next;
      triangle.previous.area = triangle.area;
      update(triangle.previous);
    } else {
      triangle[0].area = triangle[1].area;
    }

    if (triangle.next) {
      triangle.next.previous = triangle.previous;
      triangle.next[0] = triangle[0];
      update(triangle.next);
    } else {
      triangle[2].area = triangle[1].area;
    }
  }

  topology.coordinates = topology.coordinates.map(function(lineString) {
    var j = lineString.length - 1;
    return lineString.filter(function(point, i) {
      return !i || i === j || point.area >= minArea;
    });
  });

  function update(triangle) {
    heap.remove(triangle);
    triangle[1].area = area(triangle);
    heap.push(triangle);
  }

  return topology;
};

function area(t) {
  return Math.abs((t[0][0] - t[2][0]) * (t[1][1] - t[0][1]) - (t[0][0] - t[1][0]) * (t[2][1] - t[0][1]));
}
