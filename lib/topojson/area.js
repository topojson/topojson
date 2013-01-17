var π = Math.PI,
    ε = 1e-6,
    radians = π / 180;

module.exports = function(ring) {
  if (!ring.length) return 0;
  var area = 0,
      p = ring[0],
      λ = p[0] * radians,
      φ = p[1] * radians,
      λ1 = λ,
      λ0 = λ,
      φ0 = φ,
      cosφ0 = Math.cos(φ0),
      sinφ0 = Math.sin(φ0);

  for (var i = 1, n = ring.length; i < n; ++i) {
    p = ring[i], λ = p[0] * radians, φ = p[1] * radians;

    // If both the current point and the previous point are polar, skip this point.
    if (Math.abs(Math.abs(φ0) - π / 2) < ε && Math.abs(Math.abs(φ) - π / 2) < ε) continue;
    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);

    // If the previous point is at the north pole, then compute lune area.
    if (Math.abs(φ0 - π / 2) < ε) area += (λ - λ1) * 2;

    // Area of spherical triangle with vertices at south pole, previous point
    // and current point = ER², where E is the spherical excess, and in our
    // case, R = 1.
    else {
      var dλ = λ - λ0,
          cosdλ = Math.cos(dλ),
          // Distance from previous point to current point, well-conditioned
          // for all angles.
          d = Math.atan2(Math.sqrt((d = cosφ * Math.sin(dλ)) * d + (d = cosφ0 * sinφ - sinφ0 * cosφ * cosdλ) * d), sinφ0 * sinφ + cosφ0 * cosφ * cosdλ),
          // Half the semiperimeter (a + b + c) / 2, where a, b and c are the
          // lengths of the triangle sides.
          s = (d + π + φ0 + φ) / 4;
      // Compute the spherical excess E using l’Huilier’s theorem,
      // tan(E / 4) = √[tan(s)tan(s - a / 2)tan(s - b / 2)tan(s - c / 2)].
      area += (dλ < 0 && dλ > -π || dλ > π ? -4 : 4) * Math.atan(Math.sqrt(Math.abs(Math.tan(s) * Math.tan(s - d / 2) * Math.tan(s - π / 4 - φ0 / 2) * Math.tan(s - π / 4 - φ / 2))));
    }

    // Advance the previous points.
    λ1 = λ0, λ0 = λ, φ0 = φ, cosφ0 = cosφ, sinφ0 = sinφ;
  }

  return area;
};
