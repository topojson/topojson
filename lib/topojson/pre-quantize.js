var quantize = require("./quantize");

module.exports = function(objects, bbox, Q) {
  var q = quantize(bbox, Q);

  function quantizeGeometry(geometry) {
    if (geometry && quantizeGeometryType.hasOwnProperty(geometry.type)) quantizeGeometryType[geometry.type](geometry);
  }

  var quantizeGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(quantizeGeometry); },
    Point: function(o) { q.point(o.coordinates); },
    MultiPoint: function(o) { o.coordinates.forEach(q.point); },
    LineString: function(o) {
      var line = o.coordinates;
      q.line(line);
      if (line.length < 2) line[1] = line[0]; // must have 2+
    },
    MultiLineString: function(o) {
      for (var lines = o.coordinates, i = 0, n = lines.length; i < n; ++i) {
        var line = lines[i];
        q.line(line);
        if (line.length < 2) line[1] = line[0]; // must have 2+
      }
    },
    Polygon: function(o) {
      for (var rings = o.coordinates, i = 0, n = rings.length; i < n; ++i) {
        var ring = rings[i];
        q.line(ring);
        while (ring.length < 4) ring.push(ring[0]); // must have 4+
      }
    },
    MultiPolygon: function(o) {
      for (var polygons = o.coordinates, i = 0, n = polygons.length; i < n; ++i) {
        for (var rings = polygons[i], j = 0, m = rings.length; j < m; ++j) {
          var ring = rings[j];
          q.line(ring);
          while (ring.length < 4) ring.push(ring[0]); // must have 4+
        }
      }
    }
  };

  for (var key in objects) {
    quantizeGeometry(objects[key]);
  }

  return q.transform;
};
