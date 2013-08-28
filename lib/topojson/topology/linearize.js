var d3 = require("d3"),
    geomify = require("./geomify");

// Extracts the lines and rings from the specified hash of GeoJSON objects.
// Also applies the specified transform (weird).
// Also converts the GeoJSON objects to TopoJSON geometries (a bit weird).
//
// Returns an object with three properties:
//
// * coordinates - shared buffer of [x, y] coordinates
// * lines - lines extracted from the hash, of the form [start, end]
// * rings - rings extracted from the hash, of the form [start, end]
//
// For each ring or line, start and end represent inclusive indexes into the
// coordinates buffer. For rings, start = end.
//
// For each line or polygon geometry in the input hash, including nested
// geometries as in geometry collections, the `coordinates` array is replaced
// with an equivalent `arcs` array that, for each line (for line string
// geometries) or ring (for polygon geometries), points to one of the above
// lines or rings. Empty lines, polygons and points are replaced with nulls.
module.exports = function(objects, transform) {
  if (!transform) transform = identity;

  geomify(objects);

  function linearizeGeometry(geometry) {
    if (geometry.type === "GeometryCollection") {
      geometry.geometries = geometry.geometries.map(linearizeGeometry);
    } else if (linearizeGeometryType.hasOwnProperty(geometry.type)) {
      var sink = linearizeGeometryType[geometry.type];
      d3.geo.stream(geometry, transform(sink));
      sink.apply(geometry);
    }
    return geometry;
  }

  var currentPoints = [],
      currentLineStart,
      currentLines = [],
      currentPolygons = [];

  var linearizePoint = {
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

  var linearizeLine = {
    lineStart: function() {
      currentLineStart = index;
    },
    point: function(x, y) {
      coordinates[index++] = [x, y];
    },
    lineEnd: function() {
      if (currentLineStart < index) {
        var line = {0: currentLineStart, 1: index - 1};
        lines.push(line);
        currentLines.push(line);
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

  var linearizePolygon = {
    polygonStart: function() {},
    lineStart: function() {
      currentLineStart = index;
    },
    point: function(x, y) {
      coordinates[index++] = [x, y];
    },
    lineEnd: function() {
      if (currentLineStart < index) {
        coordinates[index++] = coordinates[currentLineStart]; // copy closing coordinate
        var ring = {0: currentLineStart, 1: index - 1};
        rings.push(ring);
        currentLines.push(ring);
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

  var linearizeGeometryType = {
    Point: linearizePoint,
    MultiPoint: linearizePoint,
    LineString: linearizeLine,
    MultiLineString: linearizeLine,
    Polygon: linearizePolygon,
    MultiPolygon: linearizePolygon
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
      lines = [],
      rings = [],
      coordinates = new Array(count);

  for (var key in objects) {
    objects[key] = linearizeGeometry(objects[key]);
  }

  return {
    coordinates: coordinates,
    lines: lines,
    rings: rings,
    objects: objects
  };
};

function identity(d) {
  return d;
}
