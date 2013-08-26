var bounds = require("./bounds");

// Given a TopoJSON topology in absolute coordinates,
// quantizes the arcs and converts to fixed-point delta encoding.
// This is a destructive operation that modifies the given topology!
// If the topology does not have a bounding box, one is computed automatically.
module.exports = function(topology, Q) {
  if (arguments.length < 2) Q = 1e4;

  var arcs = topology.arcs,
      i,
      n = arcs.length,
      bbox = topology.bbox || bounds(topology),
      x0 = bbox[0],
      y0 = bbox[1],
      x1 = bbox[2],
      y1 = bbox[3],
      kx = x1 - x0 ? (Q - 1) / (x1 - x0) : 1;
      ky = y1 - y0 ? (Q - 1) / (y1 - y0) : 1;

  topology.transform = {
    scale: [1 / kx, 1 / ky],
    translate: [x0, y0]
  };

  // Apply quantization and delta-encoding.
  // TODO report quantization error
  for (i = 0; i < n; ++i) {
    var absoluteArc = arcs[i],
        quantizeArc = new Array(absoluteArc.length),
        j = 0,
        m = absoluteArc.length,
        k = 0,
        point = absoluteArc[0],
        px = Math.round((point[0] - x0) * kx),
        py = Math.round((point[1] - y0) * ky);
    quantizeArc[0] = [px, py];
    while (++j < m) {
      point = absoluteArc[j];
      var x = Math.round((point[0] - x0) * kx),
          y = Math.round((point[1] - y0) * ky),
          dx = x - px,
          dy = y - py;
      if (dx || dy) quantizeArc[++k] = [dx, dy];
      px = x;
      py = y;
    }
    quantizeArc.length = k + 1; // trim unused points
    arcs[i] = quantizeArc;
  }

  function quantizeObject(object) {
    (object && quantizeObjectType.hasOwnProperty(object.type)
        ? quantizeObjectType[object.type]
        : quantizeGeometry)(object);
  }

  function quantizeFeature(feature) {
    quantizeGeometry(feature.geometry);
  }

  function quantizeGeometry(geometry) {
    if (!geometry) return;
    if (geometry.type === "GeometryCollection") return void geometry.geometries.forEach(quantizeGeometry);
    if (quantizeGeometryType.hasOwnProperty(geometry.type)) quantizeGeometryType[geometry.type](geometry);
  }

  var quantizeObjectType = {
    Feature: quantizeFeature,
    FeatureCollection: function(collection) { collection.features.forEach(quantizeFeature); }
  };

  var quantizeGeometryType = {
    Point: function(point) { quantizePoint(point.coordinates); },
    MultiPoint: function(multipoint) { multipoint.coordinates.forEach(quantizePoint); }
  };

  function quantizePoint(point) {
    point[0] = Math.round((point[0] - x0) * kx);
    point[1] = Math.round((point[1] - y0) * ky);
  }

  for (var key in topology.objects) {
    quantizeObject(topology.objects[key]);
  }

  return topology;
};
