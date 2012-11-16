var pointStore = require("./lib/topojson/point-store");

exports.toTopo = function(geoJson) {
  var topo = {
    type: "Topology",
    objects: [],
    coordinates: []
  };

  return pointStore(Object.keys(geoJson).map(function(k) { return geoJson[k]; }));
};

exports.toGeo = function(topoJson) {
  return topoJson;
};
