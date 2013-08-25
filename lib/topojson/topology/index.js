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

  function extractObject(object) {
    (object && extractObjectType.hasOwnProperty(object.type)
        ? extractObjectType[object.type]
        : extractGeometry)(object);
  }

  function extractFeature(feature) {
    extractGeometry(feature.geometry);
  }

  function extractGeometry(geometry) {
    if (!geometry) return;
    if (geometry.type === "GeometryCollection") return void geometry.geometries.forEach(extractGeometry);
    if (extractGeometryType.hasOwnProperty(geometry.type)) extractGeometryType[geometry.type](geometry);
  }

  var extractObjectType = {
    Feature: extractFeature,
    FeatureCollection: function(collection) { collection.features.forEach(extractFeature); }
  };

  var extractGeometryType = {
    Point: function() {},
    MultiPoint: function() {},
    LineString: function(o) { console.warn(o); o.coordinates = extractArcs(o.coordinates); },
    MultiLineString: function(o) { o.coordinates = o.coordinates.map(extractArcs); },
    Polygon: function(o) { o.coordinates = o.coordinates.map(extractArcs); },
    MultiPolygon: function(o) { o.coordinates = o.coordinates.map(extractMultiArcs); }
  };

  function arcCoordinates(arc) {
    console.warn(arc);
    var start = arc.start,
        end = arc.end,
        array = new Array(Math.abs(start - end) + 1);
    if (start < end) {
      for (var index = start, offset = 0; index <= end; ++index, ++offset) {
        array[offset] = [coordinates[index << 1], coordinates[(index << 1) + 1]];
      }
    } else {
      for (var index = end; index >= start; --index) {
        array[offset] = [coordinates[index << 1], coordinates[(index << 1) + 1]];
      }
    }
    return array;
  }

  function extractArcs(arc) {
    var indexes = [];
    while (arc) {
      var index = indexByArc.get(arc);
      if (index == null) {
        index = arcs.length;
        arcs.push(arcCoordinates(arc));
        indexByArc.set(arc, index);
        indexes.push(index);
      } else {
        var indexArc = arcs[index];
        indexes.push(indexArc === arc.start ? index : ~index); // TODO fix this
      }
      arc = arc.next;
    }
    return indexes;
  }

  function extractMultiArcs(arcs) {
    return arcs.map(extractArcs);
  }

  for (var key in objects) {
    extractObject(objects[key]);
  }

  topology.arcs = arcs;
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
