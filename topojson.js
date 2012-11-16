var topojson = {
  version: "0.0.1",
  mesh: function(topology) {
    var kx = topology.transform.scale[0],
        ky = topology.transform.scale[1],
        x0 = topology.transform.translate[0],
        y0 = topology.transform.translate[1];
    return {
      type: "MultiLineString",
      coordinates: topology.coordinates.map(function(lineString) {
        return lineString.map(function(point) {
          return [point[0] * kx + x0, point[1] * ky + y0];
        });
      })
    };
  }
};
