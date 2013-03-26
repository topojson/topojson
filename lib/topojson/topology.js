var type = require("./type"),
    systems = require("./coordinate-systems");

var ε = 1e-6;

module.exports = function(objects, options) {
  var Q = 1e4, // precision of quantization
      id = function(d) { return d.id; }, // function to compute object id
      propertyTransform = function() {}, // function to transform properties
      stitchPoles = true,
      verbose = false,
      x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity,
      kx,
      ky,
      εmax = 0,
      coincidences = [],
      system = null,
      arcs = [],
      arcsByIndex = [],
      pointsByIndex = [];

  if (options)
    "verbose" in options && (verbose = !!options["verbose"]),
    "stitch-poles" in options && (stitchPoles = !!options["stitch-poles"]),
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]),
    "quantization" in options && (Q = +options["quantization"]),
    "id" in options && (id = options["id"]),
    "property-transform" in options && (propertyTransform = options["property-transform"]);

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

  // For automatic coordinate system determination, consider the bounding box.
  var oversize = x0 < -180 - ε || x1 > 180 + ε || y0 < -90 - ε || y1 > 90 + ε;
  if (!system) { system = systems[oversize ? "cartesian" : "spherical"]; if (options) options["coordinate-system"] = system.name; }
  if (system === systems.spherical && oversize) throw new Error("spherical coordinates outside of [±180°, ±90°]");

  // Remove polar antimeridian cuts, i.e. all sequences:
  // [±180°, *]+, [*, ±90°]+, [±180, *]+.
  if (system === systems.spherical && stitchPoles) {
    each({
      polygon: function(polygon) {
        for (var j = 0, m = polygon.length; j < m; ++j) {
          var line = polygon[j],
              i = -1,
              n = line.length,
              a = false,
              b = false,
              c = false,
              i0 = -1;
          for (i = 0; i < n; ++i) {
            var point = line[i],
                antimeridian = Math.abs(Math.abs(point[0]) - 180) < 1e-2,
                polar = Math.abs(Math.abs(point[1]) - 90) < 1e-2;
            if (antimeridian || polar) {
              if (!(a || b || c)) i0 = i;
              if (antimeridian) {
                if (a) c = true;
                else a = true;
              }
              if (polar) b = true;
            }
            if (!antimeridian && !polar || i === n - 1) {
              if (a && b && c) {
                if (verbose) console.warn("stitch: removed polar cut [" + line[i0] + "] … [" + line[i] + "]");
                var spliced = line.splice(i0, i - i0);
                n -= i - i0;
                i = i0;
              }
              a = b = c = false;
            }
          }
        }
      }
    });

    // Recompute bounding box.
    x1 = y1 = -(x0 = y0 = Infinity);
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

    // When near the spherical coordinate limits, clamp to nice round values.
    // This avoids quantized coordinates that are slightly outside the limits.
    if (x0 < -180 + ε) x0 = -180;
    if (x1 > 180 - ε) x1 = 180;
    if (y0 < -90 + ε) y0 = -90;
    if (y1 > 90 - ε) y1 = 90;
  }

  // Compute quantization scaling factors.
  if (Q) {
    kx = x1 - x0 ? (Q - 1) / (x1 - x0) : 1;
    ky = y1 - y0 ? (Q - 1) / (y1 - y0) : 1;
  } else {
    console.warn("quantization: disabled; assuming inputs already quantized");
    Q = x1 + 1;
    kx = ky = 1;
    x0 = y0 = 0;
  }

  if (verbose) {
    var qx0 = quantizeX(x0) * (1 / kx) + x0,
        qx1 = quantizeX(x1) * (1 / kx) + x0,
        qy0 = quantizeY(y0) * (1 / ky) + y0,
        qy1 = quantizeY(y1) * (1 / ky) + y0;
    console.warn("quantization: bounds " + [qx0, qy0, qx1, qy1].join(" ") + " (" + system.name + ")");
  }

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
            ε = system.distance(x1, y1, x / kx + x0, y / ky + y0);
        if (ε > εmax) εmax = ε;
        if (!a[j]) {
          if (coincidences[j]) coincidences[j].push(line);
          else coincidences[j] = [line];
          a[j] = 1;
        }
      }
    }
  });

  if (verbose) console.warn("quantization: maximum error "  + system.formatDistance(εmax));

  // Convert features to geometries, and stitch together arcs.
  objects = each({
    Feature: function(feature) {
      var geometry = feature.geometry;
      if (feature.geometry == null) geometry = {};
      if ("id" in feature) geometry.id = feature.id;
      if ("properties" in feature) geometry.properties = feature.properties;
      return this.geometry(geometry);
    },

    FeatureCollection: function(collection) {
      collection.type = "GeometryCollection";
      collection.geometries = collection.features.map(this.Feature, this);
      delete collection.features;
      return collection;
    },

    GeometryCollection: function(collection) {
      collection.geometries = collection.geometries.map(this.geometry, this);
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
      else this.defaults.geometry.call(this, geometry);

      geometry.id = id(geometry);
      if (geometry.id == null) delete geometry.id;

      if (properties0 = geometry.properties) {
        var properties0, properties1 = {}, key0, key1;
        delete geometry.properties;
        for (var key0 in properties0) {
          if (propertyTransform(properties1, key0, properties0[key0])) {
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
      if (open) break;
      if (p && !equal(p, t)) {
        var tInP = t.every(function(line) { return p.indexOf(line) >= 0; }),
            pInT = p.every(function(line) { return t.indexOf(line) >= 0; });
        if (tInP && !pInT) --k;
        break;
      }
      p = t;
    }

    // If no shared starting point is found for closed lines, rotate to minimum.
    if (k === n && p.length > 1) {
      for (k = 0, i = 1; i < n; ++i) {
        var point = points[i],
            m = quantizeY(point[1]) * Q + quantizeX(point[0]);
        if (m < j) j = m, k = i;
      }
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
