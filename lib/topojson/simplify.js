var minHeap = require("./min-heap");

var π = Math.PI,
    radians = π / 180;

module.exports = function(topology, minArea) {
  var heap = minHeap(),
      maxArea = 0,
      triangle,
      N = 0,
      M = 0;

  topology.arcs.forEach(function(arc) {
    var triangles = [];

    arc.forEach(transformAbsolute(topology.transform));

    for (var i = 1, n = arc.length - 1; i < n; ++i) {
      triangle = arc.slice(i - 1, i + 2);
      triangle[1].area = area(triangle);
      triangles.push(triangle);
      heap.push(triangle);
    }

    // Always keep the arc endpoints!
    arc[0].area = arc[n].area = Infinity;

    N += n + 1;

    for (var i = 0, n = triangles.length; i < n; ++i) {
      triangle = triangles[i];
      triangle.previous = triangles[i - 1];
      triangle.next = triangles[i + 1];
    }
  });

  while (triangle = heap.pop()) {
    var previous = triangle.previous,
        next = triangle.next;

    // If the area of the current point is less than that of the previous point
    // to be eliminated, use the latter's area instead. This ensures that the
    // current point cannot be eliminated without eliminating previously-
    // eliminated points.
    if (triangle[1].area < maxArea) triangle[1].area = maxArea;
    else maxArea = triangle[1].area;

    if (previous) {
      previous.next = next;
      previous[2] = triangle[2];
      update(previous);
    }

    if (next) {
      next.previous = previous;
      next[0] = triangle[0];
      update(next);
    }
  }

  topology.arcs = topology.arcs.map(function(arc) {
    return arc.filter(function(point, i) {
      return point.area >= minArea;
    });
  });

  topology.arcs.forEach(function(arc) {
    arc.forEach(transformRelative(topology.transform));
    M += arc.length;
  });

  function update(triangle) {
    heap.remove(triangle);
    triangle[1].area = area(triangle);
    heap.push(triangle);
  }

  console.warn("retained " + M + " / " + N + " points (" + Math.round((M / N) * 100) + "%)")

  return topology;
};

function transformAbsolute(transform) {
  var x0 = 0,
      y0 = 0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(point, i) {
    point[0] = (x0 += point[0]) * kx + dx;
    point[1] = (y0 += point[1]) * ky + dy;
  };
}

function transformRelative(transform) {
  var x0 = 0,
      y0 = 0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(point, i) {
    var x1 = (point[0] - dx) / kx | 0,
        y1 = (point[1] - dy) / ky | 0;
    point[0] = x1 - x0;
    point[1] = y1 - y0;
    x0 = x1;
    y0 = y1;
  };
}

function area(t) {
  var p0 = t[0], p1 = t[1], p2 = t[2], y,
      x0 = p0[0] * radians,
      x1 = p1[0] * radians,
      x2 = p2[0] * radians,
      sy0 = Math.sin(y = p0[1] * radians), cy0 = Math.cos(y),
      sy1 = Math.sin(y = p1[1] * radians), cy1 = Math.cos(y),
      sy2 = Math.sin(y = p2[1] * radians), cy2 = Math.cos(y),
      a = sy0 * sy1 + cy0 * cy1 * Math.cos(x1 - x0),
      b = sy1 * sy2 + cy1 * cy2 * Math.cos(x2 - x1),
      c = sy2 * sy0 + cy2 * cy0 * Math.cos(x0 - x2);
  return 2 * Math.atan2(Math.sqrt(Math.max(0, 1 + 2 * a * b * c - a * a - b * b - c * c)), 1 + a + b + c);
}
