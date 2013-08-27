module.exports = function(bbox, Q) {
  var x0 = bbox[0],
      y0 = bbox[1],
      x1 = bbox[2],
      y1 = bbox[3];

  if (!isFinite(x0)) x0 = 0;
  if (!isFinite(x1)) x1 = 0;
  if (!isFinite(y0)) y0 = 0;
  if (!isFinite(y1)) y1 = 0;

  var kx = x1 - x0 ? (Q - 1) / (x1 - x0) : 1,
      ky = y1 - y0 ? (Q - 1) / (y1 - y0) : 1,
      line = false,
      count = 0,
      px,
      py;

  function quantize(stream) {
    return {
      point: function(x, y) {
        x = Math.round((x - x0) * kx);
        y = Math.round((y - y0) * ky);
        if (line) {
          if (x === px && y === py) return; // skip coincident points
          ++count;
        }
        stream.point(px = x, py = y);
      },
      lineStart: function() {
        line = true;
        px = py = NaN;
        count = 0;
        stream.lineStart();
      },
      lineEnd: function() {
        if (count === 1) stream.point(px, py);
        stream.lineEnd();
        line = false;
      },
      polygonStart: function() { stream.polygonStart(); },
      polygonEnd: function() { stream.polygonEnd(); }
    };
  }

  quantize.transform = {
    scale: [1 / kx, 1 / ky],
    translate: [x0, y0]
  };

  return quantize;
};
