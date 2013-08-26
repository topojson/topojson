var type = require("./type"),
    stream = require("d3").geo.stream,
    stitch = require("./stitch-poles"),
    systems = require("./coordinate-systems"),
    topologize = require("./topology/index"),
    quantize = require("./topology/quantize"),
    computeId = require("./topology/compute-id"),
    transformProperties = require("./topology/transform-properties");

var ε = 1e-6;

module.exports = function(objects, options) {
  var Q = 1e4, // precision of quantization
      id = function(d) { return d.id; }, // function to compute object id
      propertyTransform = function() {}, // function to transform properties
      stitchPoles = true,
      verbose = false,
      system = null;

  if (options)
    "verbose" in options && (verbose = !!options["verbose"]),
    "stitch-poles" in options && (stitchPoles = !!options["stitch-poles"]),
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]),
    "quantization" in options && (Q = +options["quantization"]),
    "id" in options && (id = options["id"]),
    "property-transform" in options && (propertyTransform = options["property-transform"]);

  var x0,
      y0,
      x1,
      y1;

  // Compute bounding box.
  function bound() {
    x0 = Infinity;
    y0 = Infinity;
    x1 = -Infinity;
    y1 = -Infinity;
    for (var key in objects) {
      stream(objects[key], {
        lineStart: noop,
        lineEnd: noop,
        polygonStart: noop,
        polygonEnd: noop,
        point: function(x, y) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      });
    }
  }

  // Compute initial bounding box.
  bound();

  // For automatic coordinate system determination, consider the bounding box.
  var oversize = x0 < -180 - ε || x1 > 180 + ε || y0 < -90 - ε || y1 > 90 + ε;
  if (!system) {
    system = systems[oversize ? "cartesian" : "spherical"];
    if (options) options["coordinate-system"] = system.name;
  }

  if (system === systems.spherical) {
    if (oversize) throw new Error("spherical coordinates outside of [±180°, ±90°]");
    if (stitchPoles) stitch(objects), bound();

    // When near the spherical coordinate limits, clamp to nice round values.
    // This avoids quantized coordinates that are slightly outside the limits.
    if (x0 < -180 + ε) x0 = -180;
    if (x1 > 180 - ε) x1 = 180;
    if (y0 < -90 + ε) y0 = -90;
    if (y1 > 90 - ε) y1 = 90;
  }

  if (verbose) {
    console.warn("bounds: " + [x0, y0, x1, y1].join(" ") + " (" + system.name + ")");
  }

  // Compute the new feature id and transform properties.
  computeId(objects, id);
  transformProperties(objects, propertyTransform);

  // Compute the topology.
  var topology = topologize(objects);
  topology.bbox = [x0, y0, x1, y1];
  objects = null; // for the benefit of the garbage collector

  // Apply quantization.
  if (Q) quantize(topology, Q);

  return topology;
};

function noop() {}
