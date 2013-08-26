var hashtable = require("./hashtable"),
    unify = require("./unify");

// Constructs the TopoJSON Topology for the specified hash of objects.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.
module.exports = function(objects) {
  var topology = unify(objects),
      coordinates = topology.coordinates,
      arcs = [],
      indexByArc = hashtable(1 << Math.ceil(Math.log(topology.arcs.count) / Math.LN2), hashArc, equalArc);

  objects = topology.objects; // for garbage collection

  topology.arcs = topology.arcs.map(function(arc, i) {
    indexByArc.set(arc, i);
    return arcCoordinates(arc);
  });

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

  function arcCoordinates(arc) {
    var start = arc.start,
        end = arc.end,
        array = new Array(Math.abs(start - end) + 1);
    if (start < end) {
      for (var index = start, offset = 0; index <= end; ++index, ++offset) {
        array[offset] = [coordinates[index << 1], coordinates[(index << 1) + 1]];
      }
    } else {
      for (var index = end, offset = 0; index >= start; --index, ++offset) {
        array[offset] = [coordinates[index << 1], coordinates[(index << 1) + 1]];
      }
    }
    return array;
  }

  function indexArcs(arc) {
    var indexes = [];
    while (arc) {
      var index = indexByArc.get(arc);
      indexes.push(arc.start < arc.end ? index : ~index);
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

  delete topology.coordinates;
  return topology;
};

function hashArc(arc) {
  var i = arc.start, j = arc.end, t;
  if (j < i) t = i, i = j, j = t;
  return i + 31 * j;
}

function equalArc(arcA, arcB) {
  var ia = arcA.start, ja = arcA.end,
      ib = arcB.start, jb = arcB.end, t;
  if (ja < ia) t = ia, ia = ja, ja = t;
  if (jb < ib) t = ib, ib = jb, jb = t;
  return ia === ib && ja === jb;
}
