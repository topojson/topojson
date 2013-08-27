var d3 = require("d3"),
    geomify = require("./geomify");

// Constructs a trivial topology for the specified hash of objects.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.
// The returned topology is a precursor to a TopoJSON Topology object,
// where each arc is represented as a contiguous slice of a shared buffer.
// This function does not compute the topology (that is, the shared arcs),
// but instead treats each line as a discrete arc.
module.exports = function(objects, transform) {
  if (!transform) transform = identity;

  geomify(objects);

  function arcifyGeometry(geometry) {
    if (geometry.type === "GeometryCollection") {
      geometry.geometries = geometry.geometries.map(arcifyGeometry);
    } else if (arcifyGeometryType.hasOwnProperty(geometry.type)) {
      var sink = arcifyGeometryType[geometry.type];
      d3.geo.stream(geometry, transform(sink));
      sink.apply(geometry);
    }
    return geometry;
  }

  var currentPoints = [],
      currentLineStart,
      currentLines = [],
      currentPolygons = [];

  var arcifyPoint = {
    point: function(x, y) {
      currentPoints.push([x, y]);
    },
    apply: function(geometry) {
      if (!currentPoints.length) {
        geometry.type = null;
        delete geometry.coordinates;
      } else if (currentPoints.length < 2) {
        geometry.type = "Point";
        geometry.coordinates = currentPoints[0];
      } else {
        geometry.coordinates = currentPoints;
      }
      currentPoints = [];
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
        var arc = {start: currentLineStart, end: index - 1, next: null};
        arcs.push(arc);
        currentLines.push(arc);
      }
    },
    apply: function(geometry) {
      if (!currentLines.length) {
        geometry.type = null;
        delete geometry.coordinates;
      } else if (currentLines.length < 2) {
        geometry.type = "LineString";
        geometry.arcs = currentLines[0];
        delete geometry.coordinates;
      } else {
        geometry.arcs = currentLines;
        delete geometry.coordinates;
      }
      currentLines = [];
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
        arcifiedCoordinates[i] = arcifiedCoordinates[j]; // copy closing coordinate
        arcifiedCoordinates[i + 1] = arcifiedCoordinates[j + 1];
        var arc = {start: currentLineStart, end: index - 1, next: null};
        arcs.push(arc);
        currentLines.push(arc);
      }
    },
    polygonEnd: function() {
      if (currentLines.length) currentPolygons.push(currentLines), currentLines = [];
    },
    apply: function(geometry) {
      if (!currentPolygons.length) {
        geometry.type = null;
        delete geometry.coordinates;
      } else if (currentPolygons.length < 2) {
        geometry.type = "Polygon";
        geometry.arcs = currentPolygons[0];
        delete geometry.coordinates;
      } else {
        geometry.arcs = currentPolygons;
        delete geometry.coordinates;
      }
      currentPolygons = [];
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
    d3.geo.stream(objects[key], countSink);
  }

  var index = 0,
      arcs = [],
      arcifiedCoordinates = new Float64Array(count << 1), // TODO if quantized, Int32
      arcifiedObjects = {};

  for (var key in objects) {
    arcifiedObjects[key] = arcifyGeometry(objects[key]);
  }

  return {
    type: "Topology",
    arcs: arcs,
    coordinates: arcifiedCoordinates,
    objects: arcifiedObjects
  };
};

function identity(d) {
  return d;
}
