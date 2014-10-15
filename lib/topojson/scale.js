var type = require("./type");

module.exports = function(topology, options) {
  var verbose = false,
      width,
      height,
      margin = 0,
      invert = true;

  if (options)
    "verbose" in options && (verbose = !!options["verbose"]),
    "width" in options && (width = +options["width"]),
    "height" in options && (height = +options["height"]),
    "margin" in options && (margin = +options["margin"]),
    "invert" in options && (invert = !!options["invert"]);

  var bx = topology.bbox,
      dx = bx[2] - bx[0],
      dy = bx[3] - bx[1],
      cx = (bx[2] + bx[0]) / 2,
      cy = (bx[3] + bx[1]) / 2,
      kx;

  width = Math.max(0, width - margin * 2);
  height = Math.max(0, height - margin * 2);

  if (width && height) {
    kx = Math.min(width / dx, height / dy);
  } else if (width) {
    kx = width / dx;
    height = kx * dy;
  } else {
    kx = height / dy;
    width = kx * dx;
  }

  var ky = invert ? -kx : kx,
      lt = scalePoint([bx[0], bx[1]]),
      rb = scalePoint([bx[2], bx[3]]),
      transform = topology.transform,
      tx = width / 2 + margin - cx * kx,
      ty = height / 2 + margin - cy * ky;

  topology.bbox = invert
      ? [lt[0], rb[1], rb[0], lt[1]]
      : [lt[0], lt[1], rb[0], rb[1]];

  if (verbose) {
    console.warn("scale: " + kx);
    console.warn("translate: " +  tx + ", " + ty);
  }

  function scalePoint(point) {
    return [
      point[0] * kx + tx,
      point[1] * ky + ty
    ];
  }

  if (transform) {
    transform.scale[0] *= kx;
    transform.scale[1] *= ky;
    transform.translate[0] = transform.translate[0] * kx + tx;
    transform.translate[1] = transform.translate[1] * ky + ty;
  } else {
    var scale = type({
      LineString: noop,
      MultiLineString: noop,
      Point: function(point) { point.coordinates = scalePoint(point.coordinates); },
      MultiPoint: function(multipoint) { multipoint.coordinates = multipoint.coordinates.map(scalePoint); },
      Polygon: noop,
      MultiPolygon: noop
    });

    for (var key in topology.objects) {
      scale.object(topology.objects[key]);
    }

    topology.arcs = topology.arcs.map(function(arc) {
      return arc.map(scalePoint);
    });
  }

  return topology;
};

function noop() {}
