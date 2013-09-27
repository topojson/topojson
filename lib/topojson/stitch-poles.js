var type = require("./type");

module.exports = function(objects, transform) {
  var ε = 1e-2,
      x0 = -180, x0e = x0 + ε,
      x1 = 180, x1e = x1 - ε,
      y0 = -90, y0e = y0 + ε,
      y1 = 90, y1e = y1 - ε,
      fragments = [];

  if (transform) {
    var kx = transform.scale[0],
        ky = transform.scale[1],
        dx = transform.translate[0],
        dy = transform.translate[1];

    x0 = Math.round((x0 - dx) / kx);
    x1 = Math.round((x1 - dx) / kx);
    y0 = Math.round((y0 - dy) / ky);
    y1 = Math.round((y1 - dy) / ky);
    x0e = Math.round((x0e - dx) / kx);
    x1e = Math.round((x1e - dx) / kx);
    y0e = Math.round((y0e - dy) / ky);
    y1e = Math.round((y1e - dy) / ky);
  }

  // console.warn(x0, x1, y0, y1);

  var I = 0;

  function normalizePoint(y) {
    return y <= y0e ? [0, y0] // south pole
        : y >= y1e ? [0, y1] // north pole
        : [x0, y]; // antimeridian
  }

  var stitch = type({
    polygon: function(polygon) {
      var rings = [];

      // For each ring, detect where it crosses the antimeridian or pole.
      for (var j = 0, m = polygon.length; j < m; ++j) {
        var ring = polygon[j],
            fragments = [];

        // By default, assume that this ring doesn’t need any stitching.
        fragments.push(ring);

        ring: for (var i = 0, n = ring.length; i < n; ++i) {
          var point = ring[i],
              x = point[0],
              y = point[1];

          // If this is an antimeridian or polar point…
          if (x <= x0e || x >= x1e || y <= y0e || y >= y1e) {
            // if (special) debugger;

            // Advance through any antimeridian or polar points…
            for (var i1 = i + 1; i1 < n; ++i1) {
              point = ring[i1];
              x = point[0];
              y = point[1];
              if (x > x0e && x < x1e && y > y0e && y < y1e) break;
            }

            // If this was just a single antimeridian or polar point,
            // we don’t need to cut this ring into a fragment;
            // we can just leave it as-is.
            if (i1 === i + 1) continue;

            // Otherwise, if this is not the first point in the ring,
            // cut the current fragment so that it ends at the current point.
            // The current point is also normalized for later joining.
            if (i) {
              var fragmentBefore = ring.slice(0, i);
              fragmentBefore.push(normalizePoint(y));
              fragments[fragments.length - 1] = fragmentBefore;
            }

            // If the ring started with an antimeridian fragment,
            // we can ignore that fragment entirely.
            else {
              fragments.pop();
            }

            // If the remainder of the ring is an antimeridian fragment,
            // move on to the next ring.
            if (i1 >= n) break;

            // Otherwise, add the remaining ring fragment and continue.
            fragments.push(ring = [normalizePoint(ring[i1 - 1][1])].concat(ring.slice(i1)));
            i = 0;
            n = ring.length;
          }
        }

        // Now stitch the fragments back together into rings.
        // To connect the fragments start-to-end, create a simple index by end.
        var fragmentByStart = {},
            fragmentByEnd = {};

        // For each fragment…
        for (var i = 0, n = fragments.length; i < n; ++i) {
          var fragment = fragments[i],
              start = fragment[0],
              end = fragment[fragment.length - 1];

          // If this fragment is closed, add it as a standalone ring.
          if (start[0] === end[0] && start[1] === end[1]) {
            rings.push(fragment);
            fragments[i] = null;
            continue;
          }

          fragment.index = i;
          fragmentByStart[start] = fragmentByEnd[end] = fragment;
        }

        // For each open fragment…
        for (var i = 0; i < n; ++i) {
          var fragment = fragments[i];
          if (fragment) {

            var start = fragment[0],
                end = fragment[fragment.length - 1],
                startFragment = fragmentByEnd[start],
                endFragment = fragmentByStart[end];

            delete fragmentByStart[start];
            delete fragmentByEnd[end];

            if (startFragment) {
              // if (startFragment === endFragment)

              delete fragmentByEnd[start];
              delete fragmentByStart[startFragment[0]];

              // startFragment.pop(); // drop the shared coordinate

              // delete fragmentByStart[start];
              // delete fragmentByStart[end];
              // delete fragmentByEnd[start];
              // delete fragmentByEnd[end];

              rings.push(startFragment.concat(fragment));
              // console.warn("rejoined by start");
              // console.warn(fragment.join(" "));
              // console.warn(startFragment.join(" "));
              fragment[startFragment.index] = null;
            } else if (endFragment) {
              // debugger;

              delete fragmentByStart[end];
              delete fragmentByEnd[endFragment[endFragment.length - 1]];

              // delete fragmentByStart[start];
              // delete fragmentByStart[end];
              // delete fragmentByEnd[start];
              // delete fragmentByEnd[end];

              // fragment.pop(); // drop the shared coordinate

              rings.push(fragment.concat(endFragment));
              // console.warn("rejoined by end");
              // console.warn(endFragment.join(" "));
              // console.warn(fragment.join(" "));
              fragment[endFragment.index] = null;
            }

            // for (var key in fragmentByEnd) {
            //   if (fragmentByEnd[key].length <= 1) debugger;
            // }
            // for (var key in fragmentByStart) {
            //   if (fragmentByStart[key].length <= 1) debugger;
            // }
          }
        }
      }

      // Copy the rings into the target polygon.
      for (var i = 0, n = polygon.length = rings.length; i < n; ++i) {
        polygon[i] = rings[i];
      }
    }
  });

  for (var key in objects) {
    stitch.object(objects[key]);
  }
};
