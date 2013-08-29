
// Extracts the lines and rings from the specified hash of geometry objects.
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
module.exports = function(objects) {
  var index = -1,
      lines = [],
      rings = [],
      coordinates = [];

  function linearizeGeometry(geometry) {
    if (geometry && linearizeGeometryType.hasOwnProperty(geometry.type)) linearizeGeometryType[geometry.type](geometry);
  }

  var linearizeGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(linearizeGeometry); },
    LineString: function(o) { o.arcs = linearizeLine(o.coordinates); delete o.coordinates; },
    MultiLineString: function(o) { o.arcs = o.coordinates.map(linearizeLine); delete o.coordinates; },
    Polygon: function(o) { o.arcs = o.coordinates.map(linearizeRing); delete o.coordinates; },
    MultiPolygon: function(o) { o.arcs = o.coordinates.map(linearizeMultiRing); delete o.coordinates; }
  };

  function linearizeLine(line) {
    for (var i = 0, n = line.length; i < n; ++i) coordinates[++index] = line[i];
    var arc = {0: index - n + 1, 1: index};
    lines.push(arc);
    return arc;
  }

  function linearizeRing(ring) {
    for (var i = 0, n = ring.length; i < n; ++i) coordinates[++index] = ring[i];
    var arc = {0: index - n + 1, 1: index};
    rings.push(arc);
    return arc;
  }

  function linearizeMultiRing(rings) {
    return rings.map(linearizeRing);
  }

  for (var key in objects) {
    linearizeGeometry(objects[key]);
  }

  return {
    type: "Topology",
    coordinates: coordinates,
    lines: lines,
    rings: rings,
    objects: objects
  };
};
