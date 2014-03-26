var d3 = require("d3"),
    topojson = require("../../");

module.exports = function(topology, object, key) {

  function merge(entry) {
    var id = entry.key,
        geometries = entry.values,
        type = baseType(geometries[0].type);

    if (type === "Point") {
      return {
        id: id,
        type: "MultiPoint",
        coordinates: d3.merge(geometries.map(function(geometry) {
          if (baseType(geometry.type) !== type) throw new Error("heterogenous types");
          return geometry.type === "Point" ? [geometry.coordinates] : geometry.coordinates;
        }))
      };
    }

    if (type === "LineString") {
      var mesh = topojson.arcmesh(topojson, geometries);
      mesh.id = id;
      return mesh;
    }

    if (type !== "Polygon") throw new Error("unknown type");

    var mesh = topojson.arcmesh(topojson, geometries, exterior);
    return {
      id: id,
      type: "MultiPolygon",
      arcs: mesh.arcs.map(polygon)
    };
  }

  return {
    type: "GeometryCollection",
    geometries: d3.nest().key(key).entries(object.geometries).map(merge)
  };
};

function exterior(a, b) {
  return a === b;
}

function baseType(type) {
  return type.replace(/^Multi/, "");
}

// TODO fix winding order
// TOOD fix polygon systems
function polygon(ring) {
  var polygon = [ring];
  // if (d3.geo.area({type: "Polygon", coordinates: polygon}) > 2 * Math.PI) ring.reverse(); // fix winding order
  return polygon;
}
