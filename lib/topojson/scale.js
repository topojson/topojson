var type = require("./type");

// TODO invert
module.exports = function(topology, options) {
  var width,
      height,
      margin;

  if (options)
    "width" in options && (width = +options["width"]),
    "height" in options && (height = +options["height"]),
    "margin" in options && (margin = +options["margin"]);

  var dx = topology.bbox[2] - topology.bbox[0],
      dy = topology.bbox[3] - topology.bbox[1],
      k;

  width = Math.max(0, width - margin * 2);
  height = Math.max(0, height - margin * 2);

  if (width && height) {
    k = Math.min(width / dx, height / dy);
  } else if (width) {
    k = width / dx;
    height = k * dy;
  } else {
    k = height / dy;
    width = k * dx;
  }

  if (topology.transform) {
    topology.transform.scale[0] *= k;
    topology.transform.scale[1] *= -k;
    topology.transform.translate[0] = (width - dx * k) / 2 + margin;
    topology.transform.translate[1] = (height + dy * k) / 2 + margin;
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

    function scalePoint(point) {
      return [
        point[0] * k + (width - dx * k) / 2 + margin,
        point[1] * -k + (height + dy * k) / 2 + margin
      ];
    }
  }
};

function noop() {}
