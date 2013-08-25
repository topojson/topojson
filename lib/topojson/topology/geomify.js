// Given a TopoJSON topology, replaces Features with geometry objects.
// This is a destructive operation that modifies the given topology!
module.exports = function(topology) {

  function geomifyObject(object) {
    if (object && geomifyObjectType.hasOwnProperty(object.type)) geomifyObjectType[object.type](object);
  }

  function geomifyFeature(feature) {
    var geometry = feature.geometry;
    if (geometry == null) {
      feature.type = null;
    } else {
      feature.type = geometry.type;
      feature.coordinates = geometry.coordinates;
    }
    delete feature.geometry;
  }

  var geomifyObjectType = {
    Feature: geomifyFeature,
    FeatureCollection: function(collection) {
      collection.type = "GeometryCollection";
      collection.geometries = collection.features;
      collection.features.forEach(geomifyFeature);
      delete collection.features;
    }
  };

  for (var key in topology.objects) {
    geomifyObject(topology.objects[key]);
  }

  return topology;
};
