var type = require("./type"),
    area = require("./area"),
    distance = require("./distance");

var π = Math.PI;

module.exports = function(objects, options) {
  var Q = 1e4, // precision of quantization
      id = function(d) { return d.id; }, // function to compute object id
      propertyFilter = function() { return null; }, // filter to rename properties
      verbose = false,
      x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity,
      kx,
      ky,
      ε2,
      εmax = 0,
      coincidences = [],
      arcs = [],
      arcsByIndex = [],
      pointsByIndex = [];

  if (arguments.length > 1)
    "verbose" in options && (verbose = !!options["verbose"]),
    "quantization" in options && (Q = +options["quantization"]),
    "id" in options && (id = options["id"]),
    "property-filter" in options && (propertyFilter = options["property-filter"]);

  function each(callback) {
    var t = type(callback), o = {};
    for (var k in objects) o[k] = t.object(objects[k]) || {};
    return o;
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
  kx = x1 - x0 ? (Q - 1) / (x1 - x0) : 1;
  ky = y1 - y0 ? (Q - 1) / (y1 - y0) : 1;
  ε2 = π / (kx * ky * 180 * 180 * 4);

  //
  each({
    line: function(line) {
      var i = -1,
          n = line.length,
          a = [];
      while (++i < n) {
        var point = line[i],
            x1 = point[0],
            y1 = point[1],
            x = quantizeX(x1),
            y = quantizeY(y1),
            j = y * Q + x,
            ε = distance(x1, y1, x / kx + x0, y / ky + y0);
        if (ε > εmax) εmax = ε;
        if (!a[j]) {
          if (coincidences[j]) coincidences[j].push(line);
          else coincidences[j] = [line];
          a[j] = 1;
        }
      }
    }
  });

  if (verbose) console.warn("quantization: maximum error "  + formatDistance(εmax));

  // Convert features to geometries, and stitch together arcs.
  objects = each({
    Feature: function(feature) {
      var geometry = feature.geometry;
      if (feature.geometry == null) geometry = {};
      if ("id" in feature) geometry.id = feature.id;
      if ("properties" in feature) geometry.properties = feature.properties;
      this.geometry(geometry);
      return geometry;
    },

    FeatureCollection: function(collection) {
      return {
        type: "GeometryCollection",
        geometries: collection.features.map(this.Feature, this)
      };
    },

    GeometryCollection: function(collection) {
      return {
        type: "GeometryCollection",
        geometries: collection.geometries.map(this.geometry, this)
      };
    },

    MultiPolygon: function(multiPolygon) {
      multiPolygon.arcs = multiPolygon.coordinates.map(function(polygon) { return polygon.map(lineClosed); });
    },

    Polygon: function(polygon) {
      polygon.arcs = polygon.coordinates.map(lineClosed);
    },

    MultiLineString: function(multiLineString) {
      multiLineString.arcs = multiLineString.coordinates.map(lineOpen);
    },

    LineString: function(lineString) {
      lineString.arcs = lineOpen(lineString.coordinates);
    },

    MultiPoint: function(multiPoint) {
      multiPoint.coordinates = multiPoint.coordinates.map(quantize);
    },

    Point: function(point) {
      point.coordinates = quantize(point.coordinates);
    },

    geometry: function(geometry) {
      if (geometry == null) geometry = {};
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

  function quantize(coordinates) {
    return [quantizeX(coordinates[0]), quantizeY(coordinates[1])];
  }

  function quantizeX(x) {
    return Math.round((x - x0) * kx);
  }

  function quantizeY(y) {
    return Math.round((y - y0) * ky);
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
          x = quantizeX(point[0]),
          y = quantizeY(point[1]),
          j = y * Q + x,
          t = coincidences[j];
      if (open || p && p.length < t.length) break;
      p = t;
    }

    if (n) for (var i = 0, m = open ? n : n + 1; i < m; ++i) {
      var point = points[(i + k) % n],
          x = quantizeX(point[0]),
          y = quantizeY(point[1]),
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

    arc(a, true);

    function arc(a, last) {
      var n = a.length;

      if (last && !lineArcs.length && n === 1) {
        var index = a[0];
        if (index in pointsByIndex) {
          lineArcs.push(pointsByIndex[index]);
        } else {
          lineArcs.push(pointsByIndex[index] = arcs.length);
          arcs.push(a);
        }
      } else if (n > 1) {
        var i = a[0],
            j = a[n - 1];

        // Rotate rings to the minimum value.
        if (i === j) {
          for (var k = 0, j = 1; j < n; ++j) if (a[j] < i) i = a[k = j];
          if (k) reverse(a, 0, k), reverse(a, k, n - 1), reverse(a, 0, n - 1), a[n - 1] = a[0];
        } else {
          i = Math.min(i, j);
        }

        var indexArcs = arcsByIndex[i];

        if (indexArcs) {
          if (indexArcs.some(matchForward)) return;
          if (indexArcs.some(matchBackward)) return;
          indexArcs.push(a);
        } else {
          arcsByIndex[i] = [a];
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

function formatDistance(radians) {
  var km = radians * 6371;
  return (km > 1 ? km.toFixed(3) + "km" : (km * 1000).toPrecision(3) + "m")
      + " (" + (radians * 180 / Math.PI).toPrecision(3) + "°)";
}

function reverse(array, i, j) {
  var t;
  while (i < j) t = array[i], array[i++] = array[--j], array[j] = t;
}
