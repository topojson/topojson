var topojson = {
  version: "0.0.1",
  mesh: function(topology) {
    var kx = topology.transform.scale[0],
        ky = topology.transform.scale[1],
        dx = topology.transform.translate[0],
        dy = topology.transform.translate[1];
    return {
      type: "MultiLineString",
      coordinates: topology.arcs.map(function(arc) {
        var y0 = 0,
            x0 = 0;
        return arc.map(function(point) {
          var x1 = x0 + point[0],
              y1 = y0 + point[1];
          x0 = x1;
          y0 = y1;
          return [x1 * kx + dx, y1 * ky + dy];
        });
      })
    };
  }
};
