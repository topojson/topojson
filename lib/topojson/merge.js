var d3 = require("d3"),
    topojson = require("../../");

module.exports = function(topology, object, options) {
  var key = id;

  if (options)
    "key" in options && (key = options["key"]);

  function merge(entry) {
    var id = entry.key,
        geometries = entry.values,
        type = baseType(geometries[0].type);

    if (type === "Point") {
      var points = d3.merge(geometries.map(function(geometry) {
        if (baseType(geometry.type) !== type) throw new Error("heterogenous types");
        return geometry.type === "Point" ? [geometry.coordinates] : geometry.coordinates;
      }));
      return points.length > 1
          ? {id: id, type: "MultiPoint", coordinates: points}
          : {id: id, type: "Point", coordinates: points[0]};
    }

    if (type === "LineString") {
      var geometry = topojson.arcmesh(topology, {type: "GeometryCollection", geometries: geometries});
      geometry.id = id;
      if (geometry.arcs.length === 1) geometry.type = "LineString", geometry.arcs = geometry.arcs[0];
      return geometry;
    }

    if (type !== "Polygon") throw new Error("unknown type");

    // TODO I think arcmesh can reverse rings?
    var rings = topojson.arcmesh(topology, {type: "GeometryCollection", geometries: geometries}, exterior).arcs,
        polygons = [],
        holes = [];

    rings.forEach(function(ring) {
      if (ringClockwise(asRing(ring))) polygons.push([ring]);
      else holes.push(ring);
    });

    holes.forEach(function(hole) {
      var point = asPoint(hole[0]);
      polygons.some(function(polygon) {
        if (ringContains(asRing(polygon[0]), point)) {
          polygon.push(hole);
          return true;
        }
      }) || polygons.push([hole]);
    });

    return polygons.length > 1
        ? {id: id, type: "MultiPolygon", arcs: polygons}
        : {id: id, type: "Polygon", arcs: polygons[0]};
  }

  function asPoint(point) {
    return topojson.feature(topology, {type: "Point", coordinates: topology.arcs[point < 0 ? ~point : point][0]}).geometry.coordinates;
  }

  function asRing(ring) {
    return topojson.feature(topology, {type: "Polygon", arcs: [ring]}).geometry.coordinates[0];
  }

  var geometries = d3.nest().key(key).entries(object.geometries).map(merge);

  return geometries.length > 1
      ? {type: "GeometryCollection", geometries: geometries}
      : geometries[0];
};

function exterior(a, b) {
  return a === b;
}

function baseType(type) {
  return type.replace(/^Multi/, "");
}

function id(d) {
  return d.id;
}

// TODO also support spherical coordinates
function ringClockwise(ring) {
  if ((n = ring.length) < 4) return false;
  var i = 0,
      n,
      area = ring[n - 1][1] * ring[0][0] - ring[n - 1][0] * ring[0][1];
  while (++i < n) area += ring[i - 1][1] * ring[i][0] - ring[i - 1][0] * ring[i][1];
  return area >= 0;
}

// TODO also support spherical coordinates
function ringContains(ring, point) {
  var x = point[0],
      y = point[1],
      contains = false;
  for (var i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
    var pi = ring[i], xi = pi[0], yi = pi[1],
        pj = ring[j], xj = pj[0], yj = pj[1];
    if (((yi > y) ^ (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) contains = !contains;
  }
  return contains;
}
