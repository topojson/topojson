var type = require("./type");

module.exports = function(objects, transform) {
  var kx = 1, ky = 1, dx = 0, dy = 0;
  if (transform) {
    kx = transform.scale[0];
    ky = transform.scale[1];
    dx = transform.translate[0];
    dy = transform.translate[1];
  }

  var stitch = type({
    polygon: function(polygon) {
      var rings = [],
          fragments = [];

      // Split rings into fragments where they cross the antimeridian or poles.
      for (var j = 0, m = polygon.length; j < m; ++j) {
        var ring = polygon[j],
            fragment = [],
            point0 = ring[0];
        for (var i = 1, n = ring.length; i < n; ++i, point0 = point) {
          var point = ring[i];
          if (Math.abs(Math.abs(point[0] * kx + dx) - 180) < 1e-6 || Math.abs(Math.abs(point[1] * ky + dy) - 90) < 1e-6) {
            if (fragment.length) fragment.push(point), fragments.push(fragment), fragment = [];
            continue;
          }
          if (!fragment.length) fragment.push(point0);
          fragment.push(point);
        }
        if (fragment.length) fragments.push(fragment);
      }

      if (fragments.length === 1) {
        rings.push(fragments[0]); // assume single fragment can be closed
        // TODO bail if endpoints aren't equal?
      } else if (fragments.length > 1) {
        var fragmentByStart = {},
            fragmentByEnd = {};
        // Index fragments by endpoints.
        fragments.forEach(function(f) {
          fragmentByStart[f[0]] = fragmentByEnd[f[f.length - 1]] = f;
        });
        // Pair unconnected fragments.
        fragments.forEach(function(f, i) {
          if (f.paired) return;
          var start = f[0],
              end = f[f.length - 1],
              a = fragmentByStart[end],
              b = fragmentByEnd[start];
          if (a && b && a === b) {
            delete fragmentByStart[end];
            delete fragmentByEnd[start];
            f.paired = a.paired = true;
            if (a !== f) {
              var ring = a.slice();
              ring.pop();
              rings.push(ring.concat(f));
            } else {
              rings.push(a.slice());
            }
          }
        });
      }
      polygon.length = 0;
      for (var i = 0; i < rings.length; ++i) polygon[i] = rings[i];
    }
  });

  for (var key in objects) {
    stitch.object(objects[key]);
  }
};
