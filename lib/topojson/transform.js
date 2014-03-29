module.exports = function(dx, dy, kx, ky) {
  return {
    point: function(coordinates) {
      coordinates[0] = Math.floor((coordinates[0] + dx) * kx);
      coordinates[1] = Math.floor((coordinates[1] + dy) * ky);
    },
    line: function(coordinates) {
      var i = 0,
          j = 1,
          n = coordinates.length,
          pi = coordinates[0],
          pj,
          px = pi[0] = Math.floor((pi[0] + dx) * kx),
          py = pi[1] = Math.floor((pi[1] + dy) * ky),
          x,
          y;

      while (++i < n) {
        pi = coordinates[i];
        x = Math.floor((pi[0] + dx) * kx);
        y = Math.floor((pi[1] + dy) * ky);
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
