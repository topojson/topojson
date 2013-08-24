var stream = require("./stream");

module.exports = function(objects) {

  function arcifyObject(object) {
    return (object && arcifyObjectType.hasOwnProperty(object.type)
        ? arcifyObjectType[object.type]
        : arcifyGeometry)(object);
  }

  function arcifyFeature(feature) {
    return {
      type: "Feature",
      id: feature.id,
      properties: feature.properties,
      geometry: arcifyGeometry(feature.geometry)
    };
  }

  function arcifyGeometry(geometry) {
    if (!geometry) return null;

    if (geometry.type === "GeometryCollection") return {
      type: "GeometryCollection",
      geometries: geometry.geometries.map(function(geometry) {
        return arcifyGeometry(geometry);
      })
    };

    if (!arcifyGeometryType.hasOwnProperty(geometry.type)) return null;
    var sink = arcifyGeometryType[geometry.type];
    stream(geometry, sink);
    return sink.result();
  }

  var arcifyObjectType = {
    Feature: arcifyFeature,
    FeatureCollection: function(collection) {
      return {
        type: "FeatureCollection",
        features: collection.features.map(function(feature) {
          return arcifyFeature(feature);
        })
      };
    }
  };

  var arcifyPointCount = 0,
      arcifyLineStartIndex,
      arcifyLines = [],
      arcifyPolygons = [];

  var arcifyPoint = {
    point: function(x, y) {
      var i = index++ << 1;
      arcifyPoints[i] = x;
      arcifyPoints[i + 1] = y;
      ++arcifyPointCount;
    },
    result: function() {
      var result = !arcifyPointCount ? null
          : arcifyPointCount < 2 ? {type: "Point", coordinates: index - 1}
          : {type: "MultiPoint", coordinates: {start: index - arcifyPointCount, end: index, next: null}};
      arcifyPointCount = 0;
      return result;
    }
  };

  var arcifyLine = {
    lineStart: function() {
      arcifyLineStartIndex = index;
    },
    point: function(x, y) {
      var i = index++ << 1;
      arcifyPoints[i] = x;
      arcifyPoints[i + 1] = y;
    },
    lineEnd: function() {
      if (index > arcifyLineStartIndex) arcifyLines.push({
        start: arcifyLineStartIndex,
        end: index,
        next: null // always null for a arcify
      });
    },
    result: function() {
      var result = !arcifyLines.length ? null
          : arcifyLines.length < 2 ? {type: "LineString", coordinates: arcifyLines[0]}
          : {type: "MultiLineString", coordinates: arcifyLines};
      arcifyLines = [];
      return result;
    }
  };

  var arcifyPolygon = {
    polygonStart: noop,
    lineStart: function() {
      arcifyLineStartIndex = index;
    },
    point: function(x, y) {
      var i = index++ << 1;
      arcifyPoints[i] = x;
      arcifyPoints[i + 1] = y;
    },
    lineEnd: function() {
      if (index > arcifyLineStartIndex) arcifyLines.push({
        start: arcifyLineStartIndex,
        end: index,
        next: null // always null for a arcify
      });
    },
    polygonEnd: function() {
      if (arcifyLines.length) arcifyPolygons.push(arcifyLines), arcifyLines = [];
    },
    result: function() {
      var result = !arcifyPolygons.length ? null
          : arcifyPolygons.length < 2 ? {type: "Polygon", coordinates: arcifyPolygons[0]}
          : {type: "MultiPolygon", coordinates: arcifyPolygons};
      arcifyPolygons = [];
      return result;
    }
  };

  var arcifyGeometryType = {
    Point: arcifyPoint,
    MultiPoint: arcifyPoint,
    LineString: arcifyLine,
    MultiLineString: arcifyLine,
    Polygon: arcifyPolygon,
    MultiPolygon: arcifyPolygon
  };

  var countSink = {
    polygonStart: noop,
    polygonEnd: noop,
    lineStart: noop,
    lineEnd: noop,
    point: function() {
      ++count;
    }
  };

  var count = 0;
  for (var key in objects) {
    stream(objects[key], countSink);
  }

  var arcifyPoints = new Float64Array(count << 1),
      arcifyObjects = {},
      topology = {points: arcifyPoints, objects: arcifyObjects},
      index = 0;
  for (var key in objects) {
    arcifyObjects[key] = arcifyObject(objects[key]);
  }

  return topology;
};

function noop() {}
