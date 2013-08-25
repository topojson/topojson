// Computes the bounding box of the specified topology.
// The given topology must be in absolute coordinates.
module.exports = function(topology) {
  var arcs = topology.arcs,
      i,
      n = arcs.length,
      x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;

  function boundObject(object) {
    (object && boundObjectType.hasOwnProperty(object.type)
        ? boundObjectType[object.type]
        : boundGeometry)(object);
  }

  function boundFeature(feature) {
    boundGeometry(feature.geometry);
  }

  function boundGeometry(geometry) {
    if (!geometry) return;
    if (geometry.type === "GeometryCollection") return void geometry.geometries.forEach(boundGeometry);
    if (boundGeometryType.hasOwnProperty(geometry.type)) boundGeometryType[geometry.type](geometry);
  }

  var boundObjectType = {
    Feature: boundFeature,
    FeatureCollection: function(collection) { collection.features.forEach(boundFeature); }
  };

  var boundGeometryType = {
    Point: function(point) { boundPoint(point.coordinates); },
    MultiPoint: function(multipoint) { multipoint.coordinates.forEach(boundPoint); }
  };

  function boundPoint(point) {
    var x = point[0],
        y = point[1];
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }

  for (i = 0; i < n; ++i) {
    arcs[i].forEach(boundPoint);
  }

  for (var key in topology.objects) {
    boundObject(topology.objects[key]);
  }

  return [x0, y0, x1, y1];
};
