var topology = require("./lib/topojson/topology");

exports.toTopo = function(geoJson) {
  return topology(Object.keys(geoJson).map(function(k) { return geoJson[k]; }));
};

exports.toGeo = function(topoJson) {
  throw new Error("Not yet implemented.");
};
