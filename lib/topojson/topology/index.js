var hashtable = require("./hashtable"),
    linearize = require("./linearize"),
    cut = require("./cut"),
    dedup = require("./dedup");

// Constructs the TopoJSON Topology for the specified hash of objects.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.
module.exports = function(objects, transform) {
  var topology = dedup(cut(linearize(objects, transform))),
      coordinates = topology.coordinates,
      indexByArc = hashtable(1 << Math.ceil(Math.log(topology.arcs.length) / Math.LN2), hashArc, equalArc);

  objects = topology.objects; // for garbage collection

  topology.arcs = topology.arcs.map(function(arc, i) {
    indexByArc.set(arc, i);
    return coordinates.slice(arc[0], arc[1] + 1);
  });

  delete topology.coordinates;
  coordinates = null;

  function indexObject(object) {
    (object && indexObjectType.hasOwnProperty(object.type)
        ? indexObjectType[object.type]
        : indexGeometry)(object);
  }

  function indexFeature(feature) {
    indexGeometry(feature.geometry);
  }

  function indexGeometry(geometry) {
    if (!geometry) return;
    if (geometry.type === "GeometryCollection") return void geometry.geometries.forEach(indexGeometry);
    if (indexGeometryType.hasOwnProperty(geometry.type)) indexGeometryType[geometry.type](geometry);
  }

  var indexObjectType = {
    Feature: indexFeature,
    FeatureCollection: function(collection) { collection.features.forEach(indexFeature); }
  };

  var indexGeometryType = {
    Point: function() {},
    MultiPoint: function() {},
    LineString: function(o) { o.arcs = indexArcs(o.arcs); },
    MultiLineString: function(o) { o.arcs = o.arcs.map(indexArcs); },
    Polygon: function(o) { o.arcs = o.arcs.map(indexArcs); },
    MultiPolygon: function(o) { o.arcs = o.arcs.map(indexMultiArcs); }
  };

  function indexArcs(arc) {
    var indexes = [];
    while (arc) {
      var index = indexByArc.get(arc);
      indexes.push(arc[0] < arc[1] ? index : ~index);
      arc = arc.next;
    }
    return indexes;
  }

  function indexMultiArcs(arcs) {
    return arcs.map(indexArcs);
  }

  for (var key in objects) {
    indexObject(objects[key]);
  }

  return topology;
};

function hashArc(arc) {
  var i = arc[0], j = arc[1], t;
  if (j < i) t = i, i = j, j = t;
  return i + 31 * j;
}

function equalArc(arcA, arcB) {
  var ia = arcA[0], ja = arcA[1],
      ib = arcB[0], jb = arcB[1], t;
  if (ja < ia) t = ia, ia = ja, ja = t;
  if (jb < ib) t = ib, ib = jb, jb = t;
  return ia === ib && ja === jb;
}
