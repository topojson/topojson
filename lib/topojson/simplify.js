var presimplify = require("./presimplify"),
    resimplify = require("./resimplify");

module.exports = function(topology, options) {
  presimplify(topology, options);
  topology.arcs = resimplify(topology, options).arcs;
  return topology;
};
