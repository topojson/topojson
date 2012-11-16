var pointStore = require("./lib/topojson/point-store");

exports.toTopo = function(geoJson) {
  var topo = {
    type: "Topology",
    objects: [],
    coordinates: []
  };

  var points = pointStore(Object.keys(geoJson).map(function(k) { return geoJson[k]; }));

  return topo;
};

exports.toGeo = function(topoJson) {
  return topoJson;
};
