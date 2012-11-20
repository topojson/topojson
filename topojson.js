topojson = (function() {

  function mesh(topology) {
    var arcs = [], i = -1, n = topology.arcs.length;
    while (++i < n) arcs.push([i]);
    return object(topology, {type: "MultiLineString", arcs: arcs});
  }

  function object(topology, o) {
    var tf = topology.transform,
        kx = tf.scale[0],
        ky = tf.scale[1],
        dx = tf.translate[0],
        dy = tf.translate[1],
        arcs = topology.arcs;

    function arc(index, coordinates) {
      var arc = arcs[index < 0 ? ~index : index],
          i = -1,
          n = arc.length,
          x = 0,
          y = 0,
          p;
      if (coordinates.length) coordinates.pop();
      while (++i < n) coordinates.push([(x += (p = arc[i])[0]) * kx + dx, (y += p[1]) * ky + dy]);
      if (index < 0) reverse(coordinates, coordinates.length - n, coordinates.length);
    }

    function line(arcs) {
      var coordinates = [];
      for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], coordinates);
      return coordinates;
    }

    function polygon(arcs) {
      return arcs.map(line);
    }

    function multiPolygon(arcs) {
      return arcs.map(polygon);
    }

    function geometry(o) {
      o = Object.create(o);
      o.coordinates = geometryType[o.type](o.arcs);
      return o;
    }

    var geometryType = {
      LineString: line,
      MultiLineString: polygon,
      Polygon: polygon,
      MultiPolygon: multiPolygon
    };

    return o.type === "GeometryCollection"
        ? (o = Object.create(o), o.geometries = o.geometries.map(geometry), o)
        : geometry(o);
  }

  function reverse(array, i, j) {
    var t; while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
  }

  return {
    version: "0.0.2",
    mesh: mesh,
    object: object
  };
})();
