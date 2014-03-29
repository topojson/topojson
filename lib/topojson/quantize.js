module.exports = function(bbox, Q) {
  var x0 = isFinite(bbox[0]) ? bbox[0] : 0,
      y0 = isFinite(bbox[1]) ? bbox[1] : 0,
      x1 = isFinite(bbox[2]) ? bbox[2] : 0,
      y1 = isFinite(bbox[3]) ? bbox[3] : 0,
      kx = x1 - x0 ? (Q - 1) / (x1 - x0) : 1,
      ky = y1 - y0 ? (Q - 1) / (y1 - y0) : 1;

  return {
    point: function(coordinates) {
      coordinates[0] = Math.floor((coordinates[0] - x0) * kx);
      coordinates[1] = Math.floor((coordinates[1] - y0) * ky);
    },
    line: function(coordinates) {
      var i = 0,
          j = 1,
          n = coordinates.length,
          pi = coordinates[0],
          pj,
          px = pi[0] = Math.floor((pi[0] - x0) * kx),
          py = pi[1] = Math.floor((pi[1] - y0) * ky),
          x,
          y;

      while (++i < n) {
        pi = coordinates[i];
        x = Math.floor((pi[0] - x0) * kx);
        y = Math.floor((pi[1] - y0) * ky);
        if (x !== px || y !== py) { // skip coincident points
          pj = coordinates[j++];
          pj[0] = px = x;
          pj[1] = py = y;
        }
      }

      coordinates.length = j;
    },
    transform: {
      scale: [1 / kx, 1 / ky],
      translate: [x0, y0]
    }
  };
};
