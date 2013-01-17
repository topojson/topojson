var π = Math.PI,
    radians = π / 180;

module.exports = function(ring) {
  if (!ring.length) return 0;
  var area = 0,
      p = ring[0],
      λ0 = p[0] * radians,
      δ,
      sinφ0 = Math.sin(p[1] * radians);
  for (var i = 1, n = ring.length; i < n; ++i) {
    p = ring[i];
    δ = -λ0 + (λ0 = p[0] * radians);
    if (δ > π) δ -= 2 * π;
    else if (δ < -π) δ += 2 * π;
    area += δ * (2 + sinφ0 + (sinφ0 = Math.sin(p[1] * radians)));
  }
  if (area >= 4 * π) area -= 8 * π;
  else if (area <= -4 * π) area += 8 * π;
  return area * .5;
};
