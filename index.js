var pointStore = require("./lib/topojson/point-store"),
    type = require("./lib/topojson/type");

exports.toTopo = function(geoJson) {
  return pointStore(Object.keys(geoJson).map(function(k) { return geoJson[k]; }));
};

exports.toGeo = function(topoJson) {
  return topoJson;
};

exports.round = function(geoJson, precision) {
  precision = Math.pow(10, precision);
  type({
    point: function(point) {
      point[0] = Math.round(point[0] * precision) / precision;
      point[1] = Math.round(point[1] * precision) / precision;
    }
  }).object(geoJson);
  return geoJson;
};
