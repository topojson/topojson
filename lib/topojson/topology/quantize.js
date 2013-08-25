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
    var arc = arcs[i],
        j = -1,
        m = arc.length,
        px = 0,
        py = 0;
    while (++j < m) {
      var point = arc[j],
          x = Math.round((point[0] - x0) * kx),
          y = Math.round((point[1] - y0) * ky);
      point[0] = x - px;
      point[1] = y - py;
      px = x;
      py = y;
    }
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
