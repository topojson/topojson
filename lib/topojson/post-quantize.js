var quantize = require("./quantize");

module.exports = function(topology, Q0, Q1) {
  var k = topology.bbox.every(isFinite) ? (Q0 - 1) / (Q1 - 1) : 1, q = Q0
      ? quantize([0, 0, Q0, Q0], Q1 + 1)
      : quantize(topology.bbox, Q1);

  function quantizeGeometry(geometry) {
    if (geometry && quantizeGeometryType.hasOwnProperty(geometry.type)) quantizeGeometryType[geometry.type](geometry);
  }

  var quantizeGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(quantizeGeometry); },
    Point: function(o) { q.point(o.coordinates); },
    MultiPoint: function(o) { o.coordinates.forEach(q.point); }
  };

  for (var key in topology.objects) {
    quantizeGeometry(topology.objects[key]);
  }

  topology.arcs.forEach(q.line);

  if (Q0) topology.transform.scale[0] *= k, topology.transform.scale[1] *= k;
  else topology.transform = q.transform;

  return topology;
};
