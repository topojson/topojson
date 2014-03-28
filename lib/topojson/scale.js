var type = require("./type");

module.exports = function(topology, options) {
  var width,
      height,
      margin = 0,
      invert = true;

  if (options)
    "width" in options && (width = +options["width"]),
    "height" in options && (height = +options["height"]),
    "margin" in options && (margin = +options["margin"]),
    "invert" in options && (invert = !!options["invert"]);

  var dx = topology.bbox[2] - topology.bbox[0],
      dy = topology.bbox[3] - topology.bbox[1],
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

  var ky = invert ? -kx : kx;

  if (topology.transform) {
    topology.transform.scale[0] *= kx;
    topology.transform.scale[1] *= ky;
    topology.transform.translate[0] = (width - dx * kx) / 2 + margin;
    topology.transform.translate[1] = (height - dy * ky) / 2 + margin;
  } else {
    var cx = topology.bbox[2] + topology.bbox[0],
        cy = topology.bbox[3] + topology.bbox[1];

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

    function scalePoint(point) {
      return [
        point[0] * kx + (width - cx * kx) / 2 + margin,
        point[1] * ky + (height - cy * ky) / 2 + margin
      ];
    }
  }
};

function noop() {}
