topojson = (function() {

  function mesh(topology) {
    var arcs = [], i = -1, n = topology.arcs.length;
    while (++i < n) arcs.push([i]);
    return object(topology, {type: "MultiLineString", arcs: arcs});
  }

  function object(topology, object) {
    var tf = topology.transform,
        kx = tf.scale[0],
        ky = tf.scale[1],
        dx = tf.translate[0],
        dy = tf.translate[1],
        arcs = topology.arcs;

    function geometry(object) {
      object = Object.create(object);
      object.coordinates = type[object.type](object.arcs);
      return object;
    }

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
      var coordinates = [];
      for (var i = 0, n = arcs.length; i < n; ++i) coordinates.push(line(arcs[i]));
      return coordinates;
    }

    function multiPolygon(arcs) {
      var coordinates = [];
      for (var i = 0, n = arcs.length; i < n; ++i) coordinates.push(polygon(arcs[i]));
      return coordinates;
    }

    var type = {
      LineString: line,
      MultiLineString: polygon,
      Polygon: polygon,
      MultiPolygon: multiPolygon
    };

    return object.type === "GeometryCollection"
        ? (object = Object.create(object), object.geometries = object.geometries.map(geometry), object)
        : geometry(object);
  }

  function reverse(array, i, j) {
    var t;
    while (i < --j) {
      t = array[i];
      array[i] = array[j];
      array[j] = t;
      ++i;
    }
  }

  return {
    version: "0.0.2",
    mesh: mesh,
    object: object
  };
})();
