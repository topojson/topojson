// Given a TopoJSON topology, replaces Features with geometry objects.
// This is a destructive operation that modifies the given topology!
module.exports = function(topology) {

  function geomifyObject(object) {
    return (object && geomifyObjectType.hasOwnProperty(object.type)
        ? geomifyObjectType[object.type]
        : geomifyGeometry)(object);
  }

  function geomifyFeature(feature) {
    var geometry = feature.geometry;
    if (geometry == null) {
      feature.type = null;
    } else {
      feature.type = geometry.type;
      if (geometry.coordinates) {
        if (geometry.type !== "Point" && geometry.type !== "MultiPoint") {
          feature.arcs = geometry.coordinates;
        } else {
          feature.coordinates = geometry.coordinates;
        }
      }
    }
    delete feature.geometry;
    return feature;
  }

  function geomifyGeometry(geometry) {
    if (!geometry) return {type: null};
    if (geometry.type === "GeometryCollection") {
      var geometries = geometry.geometries, i = -1, n = geometries.length;
      while (++i < n) geometries[i] = geomifyGeometry(geometries[i]);
    }
    if (geometry.coordinates && geometry.type !== "Point" && geometry.type !== "MultiPoint") {
      geometry.arcs = geometry.coordinates;
      delete geometry.coordinates;
    }
    return geometry;
  }

  var geomifyObjectType = {
    Feature: geomifyFeature,
    FeatureCollection: function(collection) {
      collection.type = "GeometryCollection";
      collection.geometries = collection.features;
      collection.features.forEach(geomifyFeature);
      delete collection.features;
      return collection;
    }
  };

  for (var key in topology.objects) {
    topology.objects[key] = geomifyObject(topology.objects[key]);
  }

  return topology;
};
