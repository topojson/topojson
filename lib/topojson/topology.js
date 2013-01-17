var type = require("./type"),
    area = require("./area");

var π = Math.PI;

module.exports = function(objects, options) {
  var Q = 1e4, // precision of quantization
      cw = true, // force exterior rings to be clockwise?
      id = function(d) { return d.id; }, // function to compute object id
      propertyFilter = function() { return null; }, // filter to rename properties
      x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity,
      kx,
      ky,
      ε2,
      coincidences = [],
      arcs = [],
      arcsByIndex = [];

  if (arguments.length > 1)
    Q = +options["quantization"],
    cw = !!options["force-clockwise"],
    id = options["id"] || id,
    propertyFilter = options["property-filter"] || propertyFilter;

  function each(callback) {
    var t = type(callback), o = {}, v;
    for (var k in objects) (v = t.object(objects[k])) && (o[k] = v);
    return o;
  }

  function quantize(point) {
    return [
      ((point[0] - x0) * kx | 0) / kx + x0,
      ((point[1] - y0) * ky | 0) / ky + y0
    ];
  }

  // Compute bounding box.
  each({
    point: function(point) {
      var x = point[0],
          y = point[1];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  });

  // Compute quantization scaling factors.
  kx = (Q - 1) / (x1 - x0);
  ky = (Q - 1) / (y1 - y0);
  ε2 = π / (kx * ky * 180 * 180 * 4);

  //
  each({
    line: function(line) {
      var i = -1,
          n = line.length,
          a = [];
      while (++i < n) {
        var point = line[i],
            x = (point[0] - x0) * kx | 0,
            y = (point[1] - y0) * ky | 0,
            j = y * Q + x;
        if (!a[j]) {
          if (coincidences[j]) coincidences[j].push(line);
          else coincidences[j] = [line];
          a[j] = 1;
        }
      }
    },
    polygon: function(coordinates) {
      var i = -1, n = coordinates.length, ring, a;
      while (++i < n) {
        ring = coordinates[i];
        if (Math.abs(a = area(ring.map(quantize))) < ε2) ring.length = 0;
        else if (cw && a < 0 ^ i > 0) ring.reverse();
        this.line(ring);
      }
    }
  });

  // Convert features to geometries, and stitch together arcs.
  objects = each({
    Feature: function(feature) {
      if (feature.geometry) {
        feature.geometry.id = feature.id;
        feature.geometry.properties = feature.properties;
        this.geometry(feature.geometry);
        return feature.geometry;
      }
    },

    FeatureCollection: function(collection) {
      return {
        type: "GeometryCollection",
        geometries: collection.features
            .map(this.Feature, this)
            .filter(function(geometry) { return geometry && (geometry.arcs || geometry.coordinates).length; })
      };
    },

    GeometryCollection: function(collection) {
      return {
        type: "GeometryCollection",
        geometries: collection.geometries
            .map(this.geometry, this)
            .filter(function(geometry) { return (geometry.arcs || geometry.coordinates).length; })
      };
    },

    MultiPolygon: function(multiPolygon) {
      multiPolygon.arcs = multiPolygon.coordinates
          .map(function(polygon) { return polygon.map(lineClosed).filter(length); })
          .filter(length);
    },

    Polygon: function(polygon) {
      polygon.arcs = polygon.coordinates
          .map(lineClosed)
          .filter(length);
    },

    MultiLineString: function(multiLineString) {
      multiLineString.arcs = multiLineString.coordinates
          .map(lineOpen)
          .filter(length);
    },

    LineString: function(lineString) {
      lineString.arcs = lineOpen(lineString.coordinates);
    },

    MultiPoint: function(multiPoint) {
      multiPoint.coordinates = multiPoint.coordinates.map(fixedPoint);
    },

    Point: function(point) {
      point.coordinates = fixedPoint(point.coordinates);
    },

    geometry: function(geometry) {
      this.defaults.geometry.call(this, geometry);
      geometry.id = id(geometry);
      if (geometry.id == null) delete geometry.id;

      if (properties0 = geometry.properties) {
        var properties0, properties1 = {}, key0, key1;
        delete geometry.properties;
        for (var key0 in properties0) {
          if ((key1 = propertyFilter(key0, geometry)) != null && properties0[key0] != null) {
            properties1[key1] = properties0[key0];
            geometry.properties = properties1;
          }
        }
      }

      if (geometry.arcs) delete geometry.coordinates;
      return geometry;
    }
  });

  function fixedPoint(coordinates) {
    return [
      (coordinates[0] - x0) * kx | 0,
      (coordinates[1] - y0) * ky | 0
    ];
  }

  function lineClosed(points) {
    return line(points, false);
  }

  function lineOpen(points) {
    return line(points, true);
  }

  function line(points, open) {
    var lineArcs = [],
        n = points.length,
        a = [],
        k = 0,
        p;

    // For closed lines, rotate to find a suitable shared starting point.
    for (; k < n; ++k) {
      var point = points[k],
          x = (point[0] - x0) * kx | 0,
          y = (point[1] - y0) * ky | 0,
          j = y * Q + x,
          t = coincidences[j];
      if (open || p && p.length < t.length) break;
      p = t;
    }

    if (n) for (var i = 0, m = open ? n : n + 1; i < m; ++i) {
      var point = points[(i + k) % n],
          x = (point[0] - x0) * kx | 0,
          y = (point[1] - y0) * ky | 0,
          j = y * Q + x,
          p = coincidences[j];
      if (!equal(p, t)) {
        var tInP = t.every(function(line) { return p.indexOf(line) >= 0; }),
            pInT = p.every(function(line) { return t.indexOf(line) >= 0; });
        if (tInP) a.push(j);
        arc(a);
        if (!tInP && !pInT) arc([a[a.length - 1], j]);
        if (pInT) a = [a[a.length - 1]];
        else a = [];
      }
      if (a[a.length - 1] !== j) a.push(j); // skip duplicate points
      t = p;
    }

    arc(a);

    function arc(a) {
      var n = a.length;

      if (n > 1) {
        var index = Math.min(a[0], a[n - 1]),
            indexArcs = arcsByIndex[index];

        if (indexArcs) {
          if (indexArcs.some(matchForward)) return;
          if (indexArcs.some(matchBackward)) return;
          indexArcs.push(a);
        } else {
          arcsByIndex[index] = [a];
        }

        lineArcs.push(a.index = arcs.length);
        arcs.push(a);
      }

      function matchForward(b) {
        var i = -1;
        if (b.length !== n) return false;
        while (++i < n) if (a[i] !== b[i]) return false;
        lineArcs.push(b.index);
        return true;
      }

      function matchBackward(b) {
        var i = -1;
        if (b.length !== n) return false;
        while (++i < n) if (a[i] !== b[n - i - 1]) return false;
        lineArcs.push(~b.index);
        return true;
      }
    }

    return lineArcs;
  }

  return {
    type: "Topology",
    transform: {
      scale: [1 / kx, 1 / ky],
      translate: [x0, y0]
    },
    objects: objects,
    arcs: arcs.map(function(arc) {
      var y0 = 0,
          x0 = 0;
      return arc.map(function(index) {
        var y1 = index / Q | 0,
            x1 = index - y1 * Q,
            dx = x1 - x0,
            dy = y1 - y0;
        x0 = x1;
        y0 = y1;
        return [dx, dy];
      });
    })
  };
};

function equal(a, b) {
  var n = a.length, i = -1;
  if (b.length !== n) return false;
  while (++i < n) if (a[i] !== b[i]) return false;
  return true;
}

function length(d) {
  return d.length;
}
