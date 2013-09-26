var hashtable = require("./hashtable"),
    extract = require("./extract"),
    cut = require("./cut"),
    dedup = require("./dedup"),
    equalPoint = require("./point-equal");

// Constructs the TopoJSON Topology for the specified hash of geometries.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.
module.exports = function(objects) {
  var topology = dedup(cut(extract(objects))),
      coordinates = topology.coordinates,
      indexByArc = hashtable(topology.arcs.length, hashArc, equalArc);

  objects = topology.objects; // for garbage collection

  topology.arcs = topology.arcs.map(function(arc, index) {
    indexByArc.set(arc, index);
    return coordinates.slice(arc[0], arc[1] + 1);
  });

  delete topology.coordinates;
  coordinates = null;

  function indexGeometry(geometry) {
    if (geometry && indexGeometryType.hasOwnProperty(geometry.type)) indexGeometryType[geometry.type](geometry);
  }

  var indexGeometryType = {
    GeometryCollection: function(o) { o.geometries.forEach(indexGeometry); },
    LineString: function(o) { o.arcs = indexArcs(o.arcs); },
    MultiLineString: function(o) { o.arcs = o.arcs.map(indexArcs); },
    Polygon: function(o) { o.arcs = indexPolygonArcs(o.arcs); },
    MultiPolygon: function(o) { o.arcs = indexMultiPolygonArcs(o.arcs); }
  };

  function indexMultiPolygonArcs(arcs) {
    // TODO merge polygons
    return arcs.map(indexPolygonArcs);
  }

  function indexPolygonArcs(arcs) {
    var byIndex = [],
        indexedArcs = [];
    for (var i = 0, n = arcs.length; i < n; ++i) {
      indexedArcs[i] = indexRingArcs(arcs[i], byIndex);
    }
    var fragments = [];
    indexedArcs.forEach(function(indexes) {
      var fragment = [];
      indexes.forEach(function(index) {
        var i = byIndex[index],
            j = byIndex[~index];
        if (i && j) {
          // Two instances of this arc, one forward and one backwards.
          if (fragment.length) fragments.push(fragment), fragment = [];
        } else if (i) fragment.push(index);
      });
      if (fragment.length) fragments.push(fragment);
    });
    var fragmentByStart = {},
        fragmentByEnd = {},
        rings = [];

    // For each fragment…
    for (var i = 0, n = fragments.length; i < n; ++i) {
      var f = fragments[i],
          f0 = f[0],
          f1 = f[f.length - 1],
          startArc = topology.arcs[f0 < 0 ? ~f0 : f0],
          endArc = topology.arcs[f1 < 0 ? ~f1 : f1];
      f.start = startArc[f0 < 0 ? startArc.length - 1 : 0];
      f.end = endArc[f1 < 0 ? 0 : endArc.length - 1];

      // If this fragment is closed, add it as a standalone ring.
      if (f.start[0] === f.end[0] && f.start[1] === f.end[1]) {
        rings.push(f);
        fragments[i] = null;
        continue;
      }

      f.index = i;
      fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
    }

    // For each open fragment…
    for (var i = 0; i < n; ++i) {
      var fragment = fragments[i];
      if (fragment) {

        var start = fragment.start,
            end = fragment.end,
            startFragment = fragmentByEnd[start],
            endFragment = fragmentByStart[end];

        delete fragmentByStart[start];
        delete fragmentByEnd[end];

        if (startFragment && endFragment) {
          delete fragmentByEnd[start];
          delete fragmentByStart[startFragment.start];
          var ring = startFragment.concat(fragment);
          rings.push(ring);
          fragments[startFragment.index] = fragments[endFragment.index] = null;
        } else {
          rings.push(fragment);
        }
      }
    }
    return rings;
  }

  function indexRingArcs(arc, byIndex) {
    var indexes = [];
    do {
      var index = indexByArc.get(arc),
          coordinates = topology.arcs[index];

      // Drop cuts, i.e. a self-intersection of the form cut = A, <cut>, A.
      for (var a = 0, b = coordinates.length; a < --b; ++a) {
        if (!equalPoint(coordinates[a], coordinates[b])) break;
      }

      // If there are no cuts, include this arc.
      if (a !== b) {
        if (arc[0] >= arc[1]) index = ~index;
        if (byIndex[index]) ++byIndex[index];
        else byIndex[index] = 1;
        indexes.push(index);
      }
    } while (arc = arc.next);
    return indexes;
  }

  function indexArcs(arc) {
    var indexes = [];
    do {
      var index = indexByArc.get(arc);
      indexes.push(arc[0] < arc[1] ? index : ~index);
    } while (arc = arc.next);
    return indexes;
  }


  for (var key in objects) {
    indexGeometry(objects[key]);
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
