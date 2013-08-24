var stream = require("./stream"),
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

  var currentPointCount = 0,
      currentLineStart,
      currentLines = [],
      currentPolygons = [];

  var arcifyPoint = {
    point: function(x, y) {
      var i = index++ << 1;
      arcifiedPoints[i] = x;
      arcifiedPoints[i + 1] = y;
      ++currentPointCount;
    },
    result: function() {
      var result = !currentPointCount ? null
          : currentPointCount < 2 ? {type: "Point", coordinates: index - 1}
          : {type: "MultiPoint", coordinates: {start: index - currentPointCount, end: index, next: null}};
      currentPointCount = 0;
      return result;
    }
  };

  var arcifyLine = {
    lineStart: function() {
      currentLineStart = index;
    },
    point: function(x, y) {
      var i = index++ << 1;
      arcifiedPoints[i] = x;
      arcifiedPoints[i + 1] = y;
    },
    lineEnd: function() {
      if (currentLineStart < index) {
        var arc = {start: currentLineStart, end: index, next: null};
        while (currentLineStart < index) recordOccurrence(arc, currentLineStart++);
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
    polygonStart: noop,
    lineStart: function() {
      currentLineStart = index;
    },
    point: function(x, y) {
      var i = index++ << 1;
      arcifiedPoints[i] = x;
      arcifiedPoints[i + 1] = y;
    },
    lineEnd: function() {
      if (currentLineStart < index) {
        var arc = {start: currentLineStart, end: index, next: null};
        while (currentLineStart < index) recordOccurrence(arc, currentLineStart++);
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

  var countSink = {
    polygonStart: noop,
    polygonEnd: noop,
    lineStart: noop,
    lineEnd: noop,
    point: function() {
      ++count;
    }
  };

  function recordOccurrence(arc, index) {
    var i = index << 1,
        point = arcifiedPoints.slice(i, i + 2),
        arcs = arcsByPoint.get(point);
    if (!arcs) arcsByPoint.set(point, [arc]);
    else if (arcs.indexOf(arc) < 0) arcs.push(arc); // TODO remove indexOf?
  }

  var count = 0;
  for (var key in objects) {
    stream(objects[key], countSink);
  }

  var arcifiedPoints = new Float64Array(count << 1),
      arcifiedObjects = {},
      arcsByPoint = hashtable(1 << Math.ceil(Math.log(count) / Math.LN2), hashPoint, equalPoint),
      index = 0;
  for (var key in objects) {
    arcifiedObjects[key] = arcifyObject(objects[key]);
  }

  return {
    points: arcifiedPoints,
    occurrences: arcsByPoint,
    objects: arcifiedObjects
  };
};

function noop() {}

var hashBuffer = new ArrayBuffer(8),
    hashFloats = new Float64Array(hashBuffer),
    hashInts = new Int32Array(hashBuffer);

function hashFloat(x) {
  hashFloats[0] = x;
  x = hashInts[1] ^ hashInts[0];
  x ^= (x >>> 20) ^ (x >>> 12);
  x ^= (x >>> 7) ^ (x >>> 4);
  return x;
}

function hashPoint(point) {
  var h = (hashFloat(point[0]) + 31 * hashFloat(point[1])) | 0;
  return h < 0 ? ~h : h;
}

function equalPoint(pointA, pointB) {
  return pointA[0] === pointB[0]
      && pointA[1] === pointB[1];
}
