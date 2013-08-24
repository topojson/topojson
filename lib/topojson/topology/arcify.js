var stream = require("d3").geo.stream,
    hashtable = require("./hashtable");

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

  var currentPoints = [],
      currentLineStart,
      currentLines = [],
      currentPolygons = [];

  var arcifyPoint = {
    point: function(x, y) {
      currentPoints.push([x, y]);
    },
    result: function() {
      var result = !currentPoints.length ? null
          : currentPoints.length < 2 ? {type: "Point", coordinates: currentPoints[0]}
          : {type: "MultiPoint", coordinates: currentPoints};
      currentPoints = [];
      return result;
    }
  };

  var arcifyLine = {
    lineStart: function() {
      currentLineStart = index;
    },
    point: function(x, y) {
      var i = index++ << 1;
      arcifiedCoordinates[i] = x;
      arcifiedCoordinates[i + 1] = y;
    },
    lineEnd: function() {
      if (currentLineStart < index) {
        var arc = {start: currentLineStart, end: index, next: null};
        arcs.push(arc);
        currentLines.push(arc);
      }
    },
    result: function() {
      var result = !currentLines.length ? null
          : currentLines.length < 2 ? {type: "LineString", coordinates: currentLines[0]}
          : {type: "MultiLineString", coordinates: currentLines};
      currentLines = [];
      return result;
    }
  };

  var arcifyPolygon = {
    polygonStart: function() {},
    lineStart: function() { currentLineStart = index; },
    point: function(x, y) {
      var i = index++ << 1;
      arcifiedCoordinates[i] = x;
      arcifiedCoordinates[i + 1] = y;
    },
    lineEnd: function() {
      if (currentLineStart < index) {
        var j = currentLineStart << 1,
            i = index++ << 1;
        arcifiedCoordinates[i] = arcifiedCoordinates[j];
        arcifiedCoordinates[i + 1] = arcifiedCoordinates[j + 1];
        var arc = {start: currentLineStart, end: index, next: null};
        arcs.push(arc);
        currentLines.push(arc);
      }
    },
    polygonEnd: function() {
      if (currentLines.length) currentPolygons.push(currentLines), currentLines = [];
    },
    result: function() {
      var result = !currentPolygons.length ? null
          : currentPolygons.length < 2 ? {type: "Polygon", coordinates: currentPolygons[0]}
          : {type: "MultiPolygon", coordinates: currentPolygons};
      currentPolygons = [];
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

  var countPoint = 0, countLineEnd = 0, countSink = {
    polygonStart: function() { countLineEnd = 1; },
    polygonEnd: function() { countLineEnd = 0; },
    lineStart: function() { countPoint = 1; },
    lineEnd: function() { count += countLineEnd; countPoint = 0; },
    point: function() { count += countPoint; }
  };

  var count = 0;
  for (var key in objects) {
    stream(objects[key], countSink);
  }

  var arcs = [],
      arcifiedCoordinates = new Float64Array(count << 1),
      arcifiedObjects = {},
      index = 0;
  for (var key in objects) {
    arcifiedObjects[key] = arcifyObject(objects[key]);
  }

  return {
    arcs: arcs,
    coordinates: arcifiedCoordinates,
    objects: arcifiedObjects
  };
};
