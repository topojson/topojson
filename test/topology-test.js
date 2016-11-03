var tape = require("tape"),
    client = require("topojson-client"),
    topojson = require("../");

tape("topology exact duplicate lines ABC & ABC share the arc ABC", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 0],
    arcs: [
      [[0, 0], [1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("topology reversed duplicate lines ABC & CBA share the arc ABC", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 0],
    arcs: [
      [[0, 0], [1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [~0]
      }
    }
  });
  test.end();
});

tape("topology when an old arc ABC extends a new arc AB, they share the arc AB", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 0],
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("topology when a reversed old arc CBA extends a new arc AB, they share the arc BA", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 0],
    arcs: [
      [[2, 0], [1, 0]],
      [[1, 0], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [~1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ADE shares its start with an old arc ABC, they don’t share arcs", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 1], [2, 1]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 1],
    arcs: [
      [[0, 0], [1, 0], [2, 0]],
      [[0, 0], [1, 1], [2, 1]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc DEC shares its start with an old arc ABC, they don’t share arcs", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 1], [1, 1], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 1],
    arcs: [
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABC extends an old arc AB, they share the arc AB", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 0],
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [0, 1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABC extends a reversed old arc BA, they share the arc BA", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 0],
    arcs: [
      [[1, 0], [0, 0]],
      [[1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [~0, 1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc starts BC in the middle of an old arc ABC, they share the arc BC", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 0],
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc BC starts in the middle of a reversed old arc CBA, they share the arc CB", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 0],
    arcs: [
      [[2, 0], [1, 0]],
      [[1, 0], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [~0]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABD deviates from an old arc ABC, they share the arc AB", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [3, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 3, 0],
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]],
      [[1, 0], [3, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [0, 2]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABD deviates from a reversed old arc CBA, they share the arc BA", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [3, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 3, 0],
    arcs: [
      [[2, 0], [1, 0]],
      [[1, 0], [0, 0]],
      [[1, 0], [3, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [~1, 2]
      }
    }
  });
  test.end();
});

tape("topology when a new arc DBC merges into an old arc ABC, they share the arc BC", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[3, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 3, 0],
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]],
      [[3, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [2, 1]
      }
    }
  });
  test.end();
});

tape("topology when a new arc DBC merges into a reversed old arc CBA, they share the arc CB", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[3, 0], [1, 0], [2, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 3, 0],
    arcs: [
      [[2, 0], [1, 0]],
      [[1, 0], [0, 0]],
      [[3, 0], [1, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [2, ~0]
      }
    }
  });
  test.end();
});

tape("topology when a new arc DBE shares a single midpoint with an old arc ABC, they share the point B, but no arcs", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 1], [1, 0], [2, 1]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 1],
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]],
      [[0, 1], [1, 0]],
      [[1, 0], [2, 1]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1]
      },
      bar: {
        type: "LineString",
        arcs: [2, 3]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABDE skips a point with an old arc ABCDE, they share arcs AB and DE", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 4, 0],
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0], [3, 0]],
      [[3, 0], [4, 0]],
      [[1, 0], [3, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2]
      },
      bar: {
        type: "LineString",
        arcs: [0, 3, 2]
      }
    }
  });
  test.end();
});

tape("topology when a new arc ABDE skips a point with a reversed old arc EDCBA, they share arcs BA and ED", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 4, 0],
    arcs: [
      [[4, 0], [3, 0]],
      [[3, 0], [2, 0], [1, 0]],
      [[1, 0], [0, 0]],
      [[1, 0], [3, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2]
      },
      bar: {
        type: "LineString",
        arcs: [~2, 3, ~0]
      }
    }
  });
  test.end();
});

tape("topology when an arc ABCDBE self-intersects, it is still one arc", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 4, 0],
    arcs: [
      [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("topology when an old arc ABCDBE self-intersects and shares a point B, the old arc has multiple cuts", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 0], [4, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 1], [1, 0], [2, 1]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 4, 1],
    arcs: [
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0], [3, 0], [1, 0]],
      [[1, 0], [4, 0]],
      [[0, 1], [1, 0]],
      [[1, 0], [2, 1]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0, 1, 2]
      },
      bar: {
        type: "LineString",
        arcs: [3, 4]
      }
    }
  });
  test.end();
});

tape("topology when an arc ABCA is closed, it has one arc", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 1, 1],
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("topology exact duplicate closed lines ABCA & ABCA share the arc ABCA", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 1, 1],
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [0]
      }
    }
  });
  test.end();
});

tape("topology reversed duplicate closed lines ABCA & ACBA share the arc ABCA", function(test) {
  var topology = topojson.topology({
    foo: {
      type: "LineString",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    },
    bar: {
      type: "LineString",
      coordinates: [[0, 0], [0, 1], [1, 0], [0, 0]]
    }
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 1, 1],
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      foo: {
        type: "LineString",
        arcs: [0]
      },
      bar: {
        type: "LineString",
        arcs: [~0]
      }
    }
  });
  test.end();
});

tape("topology coincident closed polygons ABCA & BCAB share the arc BCAB", function(test) {
  var topology = topojson.topology({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    bcab: {type: "Polygon", coordinates: [[[1, 0], [0, 1], [0, 0], [1, 0]]]}
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 1, 1],
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      abca: {type: "Polygon", arcs: [[0]]},
      bcab: {type: "Polygon", arcs: [[0]]}
    }
  });
  test.end();
});

tape("topology coincident reversed closed polygons ABCA & BACB share the arc BCAB", function(test) {
  var topology = topojson.topology({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    bacb: {type: "Polygon", coordinates: [[[1, 0], [0, 0], [0, 1], [1, 0]]]}
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 1, 1],
    arcs: [
      [[0, 0], [1, 0], [0, 1], [0, 0]]
    ],
    objects: {
      abca: {type: "Polygon", arcs: [[0]]},
      bacb: {type: "Polygon", arcs: [[~0]]}
    }
  });
  test.end();
});

tape("topology coincident closed polygons ABCA & DBED share the point B", function(test) {
  var topology = topojson.topology({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]]},
    dbed: {type: "Polygon", coordinates: [[[2, 1], [1, 0], [2, 2], [2, 1]]]}
  });
  test.deepEqual(topology, {
    type: "Topology",
    bbox: [0, 0, 2, 2],
    arcs: [
      [[1, 0], [0, 1], [0, 0], [1, 0]],
      [[1, 0], [2, 2], [2, 1], [1, 0]]
    ],
    objects: {
      abca: {
        type: "Polygon",
        arcs: [[0]]
      },
      dbed: {
        type: "Polygon",
        arcs: [[1]]
      }
    }
  });
  test.end();
});

// The topology `objects` is a map of geometry objects by name, allowing
// multiple GeoJSON geometry objects to share the same topology. When you
// pass multiple input files to bin/topojson, the basename of the file is
// used as the key, but you're welcome to edit the file to change it.
tape("topology input objects are mapped to topology.objects", function(test) {
  var topology = topojson.topology({
    foo: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]},
    bar: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}
  });
  test.equal(topology.objects.foo.type, "LineString");
  test.equal(topology.objects.bar.type, "Polygon");
  test.end();
});

// TopoJSON doesn't use features because you can represent the same
// information more compactly just by using geometry objects.
tape("topology features are mapped to geometries", function(test) {
  var topology = topojson.topology({
    foo: {type: "Feature", geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}},
    bar: {type: "Feature", geometry: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}}
  });
  test.equal(topology.objects.foo.type, "LineString");
  test.equal(topology.objects.bar.type, "Polygon");
  test.end();
});

tape("topology feature collections are mapped to geometry collections", function(test) {
  var topology = topojson.topology({
    collection: {
      type: "FeatureCollection",
      features: [
        {type: "Feature", geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}},
        {type: "Feature", geometry: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}}
      ]
    }
  });
  test.equal(topology.objects.collection.type, "GeometryCollection");
  test.equal(topology.objects.collection.geometries.length, 2);
  test.equal(topology.objects.collection.geometries[0].type, "LineString");
  test.equal(topology.objects.collection.geometries[1].type, "Polygon");
  test.end();
});

tape("topology nested geometry collections", function(test) {
  var topology = topojson.topology({
    collection: {
      type: "GeometryCollection",
      geometries: [
        {type: "GeometryCollection", geometries: [
          {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}
        ]},
        {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}
      ]
    }
  });
  test.equal(topology.objects.collection.geometries[0].geometries[0].arcs.length, 1);
  test.end();
});

tape("topology null geometry objects are preserved in geometry collections", function(test) {
  var topology = topojson.topology({
    collection: {
      type: "GeometryCollection",
      geometries: [
        null,
        {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}
      ]
    }
  });
  test.equal(topology.objects.collection.type, "GeometryCollection");
  test.equal(topology.objects.collection.geometries.length, 2);
  test.equal(topology.objects.collection.geometries[0].type, null);
  test.equal(topology.objects.collection.geometries[1].type, "Polygon");
  test.end();
});

tape("topology features with null geometry objects are preserved in feature collections", function(test) {
  var topology = topojson.topology({
    collection: {
      type: "FeatureCollection",
      features: [
        {type: "Feature", geometry: null},
        {type: "Feature", geometry: {type: "Polygon", coordinates: [[[.5, .6], [.7, .8]]]}}
      ]
    }
  });
  test.equal(topology.objects.collection.type, "GeometryCollection");
  test.equal(topology.objects.collection.geometries.length, 2);
  test.equal(topology.objects.collection.geometries[0].type, null);
  test.equal(topology.objects.collection.geometries[1].type, "Polygon");
  test.end();
});

tape("topology top-level features with null geometry objects are preserved", function(test) {
  var topology = topojson.topology({feature: {type: "Feature", geometry: null}});
  test.deepEqual(topology.objects, {feature: {type: null}});
  test.end();
});

// To know what a geometry object represents, specify an id. I prefer
// numeric identifiers, such as ISO 3166-1 numeric, but strings work too.
tape("topology converting a feature to a geometry preserves its id", function(test) {
  var topology = topojson.topology({foo: {type: "Feature", id: 42, properties: {}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}});
  test.equal(topology.objects.foo.type, "LineString");
  test.equal(topology.objects.foo.id, 42);
  test.end();
});

tape("topology converting a feature to a geometry preserves its bbox", function(test) {
  var topology = topojson.topology({foo: {type: "Feature", bbox: [0, 0, 10, 10], properties: {}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}});
  test.deepEqual(topology.objects.foo.bbox, [0, 0, 10, 10]);
  var topology = topojson.topology({foo: {type: "Feature", properties: {}, geometry: {type: "LineString", bbox: [0, 0, 10, 10], coordinates: [[.1, .2], [.3, .4]]}}});
  test.deepEqual(topology.objects.foo.bbox, [0, 0, 10, 10]);
  test.end();
});

tape("topology converting a feature to a geometry preserves its properties", function(test) {
  var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {name: "George"}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}});
  test.deepEqual(topology.objects.foo.properties, {name: "George"});
  var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {name: "George"}, geometry: {type: "GeometryCollection", geometries: [{type: "LineString", coordinates: [[.1, .2], [.3, .4]]}]}}});
  test.deepEqual(topology.objects.foo.properties, {name: "George"});
  var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {name: "George", demeanor: "curious"}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}});
  test.deepEqual(topology.objects.foo.properties, {name: "George", demeanor: "curious"});
  var topology = topojson.topology({foo: {type: "Feature", id: "Foo", properties: {}, geometry: {type: "LineString", coordinates: [[.1, .2], [.3, .4]]}}});
  test.deepEqual(topology.objects.foo.properties, {});
  test.end();
});

// It's not required by the specification that the transform exactly
// encompass the input geometry, but this is a good test that the reference
// implementation is working correctly.
tape("topology the returned transform exactly encompasses the input geometry", function(test) {
  var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/4]]}}, 2);
  test.deepEqual(topology.transform, {scale: [3/8, 3/16], translate: [1/8, 1/16]});
  var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, 2);
  test.deepEqual(topology.transform, {scale: [3/8, 3/16], translate: [1/8, 1/16]});
  test.end();
});

// TopoJSON uses integers with delta encoding to represent geometry
// efficiently. (Quantization is necessary for simplification anyway, so
// that we can identify which points are shared by contiguous geometry
// objects.) The delta encoding works particularly well because line strings
// are not random: most points are very close to their neighbors!
tape("topology arc coordinates are integers with delta encoding", function(test) {
  // var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/16], [1/8, 1/4], [1/2, 1/4]]}}, 2);
  // test.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [-1, 1], [1, 0]]);
  var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, 2);
  test.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]);
  test.end();
});

// TopoJSON uses integers with for points, also. However, there’s no delta-
// encoding, even for MultiPoints. And, unlike other geometry objects,
// points are still defined with coordinates rather than arcs.
tape("topology points coordinates are integers with delta encoding", function(test) {
  var topology = topojson.topology({foo: {type: "Point", coordinates: [1/8, 1/16]}, bar: {type: "Point", coordinates: [1/2, 1/4]}}, 2);
  test.deepEqual(topology.arcs, []);
  test.deepEqual(topology.objects.foo, {type: "Point", coordinates: [0, 0]});
  test.deepEqual(topology.objects.bar, {type: "Point", coordinates: [1, 1]});
  var topology = topojson.topology({foo: {type: "MultiPoint", coordinates: [[1/8, 1/16], [1/2, 1/4]]}}, 2);
  test.deepEqual(topology.arcs, []);
  test.deepEqual(topology.objects.foo, {type: "MultiPoint", coordinates: [[0, 0], [1, 1]]});
  test.end();
});

// Rounding is more accurate than flooring.
tape("topology quantization rounds to the closest integer coordinate to minimize error", function(test) {
  var topology = topojson.topology({foo: {type: "LineString", coordinates: [[0.0, 0.0], [0.5, 0.5], [1.6, 1.6], [3.0, 3.0], [4.1, 4.1], [4.9, 4.9], [5.9, 5.9], [6.5, 6.5], [7.0, 7.0], [8.4, 8.4], [8.5, 8.5], [10, 10]]}}, 11);
  test.deepEqual(client.feature(topology, topology.objects.foo).geometry.coordinates, [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]]);
  test.deepEqual(topology.arcs, [[[0, 0], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1]]]);
  test.deepEqual(topology.transform, {scale: [1, 1], translate: [0, 0]});
  test.end();
});

// When rounding, we must be careful not to exceed [±180°, ±90°]!
tape("topology quantization precisely preserves minimum and maximum values", function(test) {
  var topology = topojson.topology({foo: {type: "LineString", coordinates: [[-180, -90], [0, 0], [180, 90]]}}, 3);
  test.deepEqual(client.feature(topology, topology.objects.foo).geometry.coordinates, [[-180, -90], [0, 0], [180, 90]]);
  test.deepEqual(topology.arcs, [[[0, 0], [1, 1], [1, 1]]]);
  test.deepEqual(topology.transform, {scale: [180, 90], translate: [-180, -90]});
  test.end();
});

// GeoJSON inputs are in floating point format, so some error may creep in
// that prevents you from using exact match to determine shared points. The
// default quantization, 1e4, allows for 10,000 differentiable points in
// both dimensions. If you're using TopoJSON to represent especially high-
// precision geometry, you might want to increase the precision; however,
// this necessarily increases the output size and the likelihood of seams
// between contiguous geometry after simplification. The quantization factor
// should be a power of ten for the most efficient representation, since
// JSON uses base-ten encoding for numbers.
tape("topology precision of quantization is configurable", function(test) {
  var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/2, 1/16], [1/8, 1/4], [1/2, 1/4]]}}, 3);
  test.deepEqual(topology.arcs[0], [[0, 0], [2, 0], [-2, 2], [2, 0]]);
  var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, 5);
  test.deepEqual(topology.arcs[0], [[0, 0], [4, 0], [0, 4], [-4, 0], [0, -4]]);
  test.end();
});

// Quantization may introduce coincident points, so these are removed.
tape("topology coincident points are removed", function(test) {
  var topology = topojson.topology({foo: {type: "LineString", coordinates: [[1/8, 1/16], [1/8, 1/16], [1/2, 1/4], [1/2, 1/4]]}}, 2);
  test.deepEqual(topology.arcs, [[[0, 0], [1, 1]]]);
  var topology = topojson.topology({foo: {type: "Polygon", coordinates: [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/4], [1/8, 1/16]]]}}, 2);
  test.deepEqual(topology.arcs[0], [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]);
  test.end();
});

// Quantization may introduce degenerate features which have collapsed onto a single point.
tape("topology collapsed lines are preserved", function(test) {
  var topology = topojson.topology({
    foo: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 2]]},
    bar: {type: "LineString", coordinates: [[-80, -80], [0, 0], [80, 80]]}
  }, 3);
  test.deepEqual(topology.objects.foo, {type: "LineString", arcs: [0]});
  test.deepEqual(topology.arcs[0], [[1, 1], [0, 0]]);
  test.end();
});

tape("topology collapsed lines in a MultiLineString are preserved", function(test) {
  var topology = topojson.topology({foo: {type: "MultiLineString", coordinates: [[[1/8, 1/16], [1/2, 1/4]], [[1/8, 1/16], [1/8, 1/16]], [[1/2, 1/4], [1/8, 1/16]]]}}, 2);
  test.equal(topology.arcs.length, 2);
  test.deepEqual(topology.arcs[1], [[0, 0], [0, 0]]);
  test.deepEqual(topology.arcs[0], [[0, 0], [1, 1]]);
  test.deepEqual(topology.objects.foo.arcs, [[0], [1], [~0]]);
  test.end();
});

tape("topology collapsed polygons are preserved", function(test) {
  var topology = topojson.topology({
    foo: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]},
    bar: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]},
    baz: {type: "MultiPoint", coordinates: [[-80, -80], [0, 0], [80, 80]]}
  }, 3);
  test.deepEqual(topology.objects.foo, {type: "Polygon", arcs: [[0]]});
  test.deepEqual(topology.objects.bar, {type: "Polygon", arcs: [[0]]});
  test.deepEqual(topology.arcs[0], [[1, 1], [0, 0], [0, 0], [0, 0]]);
  test.end();
});

tape("topology collapsed polygons in a MultiPolygon are preserved", function(test) {
  var topology = topojson.topology({foo: {type: "MultiPolygon", coordinates: [
    [[[1/8, 1/16], [1/2, 1/16], [1/2, 1/4], [1/8, 1/4], [1/8, 1/16]]],
    [[[1/8, 1/16], [1/8, 1/16], [1/8, 1/16], [1/8, 1/16]]],
    [[[1/8, 1/16], [1/8, 1/4], [1/2, 1/4], [1/2, 1/16], [1/8, 1/16]]]
  ]}}, 2);
  test.equal(topology.arcs.length > 0, true);
  test.equal(topology.arcs[0].length >= 2, true);
  test.equal(topology.objects.foo.arcs.length === 3, true);
  test.end();
});

tape("topology collapsed geometries in a GeometryCollection are preserved", function(test) {
  var topology = topojson.topology({collection: {type: "FeatureCollection", features: [{type: "Feature", geometry: {type: "MultiPolygon", coordinates: []}}]}}, 2);
  test.equal(topology.arcs.length, 0);
  test.deepEqual(topology.objects.collection, {type: "GeometryCollection", geometries: [{type: null}]});
  test.end();
});

// If one of the top-level objects in the input is empty, however, it is
// still preserved in the output.
tape("topology empty geometries are not removed", function(test) {
  var topology = topojson.topology({foo: {type: "MultiPolygon", coordinates: []}}, 2);
  test.equal(topology.arcs.length, 0);
  test.deepEqual(topology.objects.foo, {type: null});
  test.end();
});

tape("topology empty polygons are not removed", function(test) {
  var topology = topojson.topology({
    foo: {type: "FeatureCollection", features: [{type: "Feature", geometry: {type: "MultiPolygon", coordinates: [[]]}}]},
    bar: {type: "Polygon", coordinates: []}
  });
  test.equal(topology.arcs.length, 0);
  test.deepEqual(topology.objects.foo, {type: "GeometryCollection", geometries: [{type: null}]});
  test.deepEqual(topology.objects.bar, {type: null});
  test.end();
});

//
// A-----B
//
tape("topology the lines AB and AB share the same arc", function(test) {
  var topology = topojson.topology({
    ab: {type: "LineString", coordinates: [[0, 0], [0, 1]]},
    ba: {type: "LineString", coordinates: [[0, 0], [0, 1]]}
  });
  test.deepEqual(topology.objects.ab, {type: "LineString", arcs: [0]});
  test.deepEqual(topology.objects.ba, {type: "LineString", arcs: [0]});
  test.end();
});

//
// A-----B
//
tape("topology the lines AB and BA share the same arc", function(test) {
  var topology = topojson.topology({
    ab: {type: "LineString", coordinates: [[0, 0], [0, 1]]},
    ba: {type: "LineString", coordinates: [[0, 1], [0, 0]]}
  });
  test.deepEqual(topology.objects.ab, {type: "LineString", arcs: [0]});
  test.deepEqual(topology.objects.ba, {type: "LineString", arcs: [~0]});
  test.end();
});

//
// A
//  \
//   \
//    \
//     \
//      \
// B-----C-----D
//
tape("topology the lines ACD and BCD share three arcs", function(test) {
  var topology = topojson.topology({
    acd: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1]]},
    bcd: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1]]}
  });
  test.deepEqual(topology.objects.acd, {type: "LineString", arcs: [0, 1]});
  test.deepEqual(topology.objects.bcd, {type: "LineString", arcs: [2, 1]});
  test.end();
});

//
// A
//  \
//   \
//    \
//     \
//      \
// B-----C-----D
//
tape("topology the lines ACD and DCB share three arcs", function(test) {
  var topology = topojson.topology({
    acd: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1]]},
    dcb: {type: "LineString", coordinates: [[2, 1], [1, 1], [0, 1]]}
  }, 3);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 2]], // AC
    [[1, 2], [1, 0]], // CD
    [[1, 2], [-1, 0]], // CB
  ]);
  test.deepEqual(topology.objects.acd, {type: "LineString", arcs: [0, 1]});
  test.deepEqual(topology.objects.dcb, {type: "LineString", arcs: [~1, 2]});
  test.end();
});

//
// A
//  \
//   \
//    \
//     \
//      \
// B-----C-----D-----F
//
tape("topology the lines ACDF and BCDF share three arcs", function(test) {
  var topology = topojson.topology({
    acdf: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 1]]},
    bcdf: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1], [3, 1]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 3]], // AC
    [[1, 3], [1, 0], [1, 0]], // CDF
    [[0, 3], [1, 0]] // BC
  ]);
  test.deepEqual(topology.objects.acdf, {type: "LineString", arcs: [0, 1]});
  test.deepEqual(topology.objects.bcdf, {type: "LineString", arcs: [2, 1]});
  test.end();
});

//
//                   E
//                  /
//                 /
//                /
//               /
//              /
// B-----C-----D-----F
//
tape("topology the lines BCDE and BCDF share three arcs", function(test) {
  var topology = topojson.topology({
    bcde: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1], [3, 0]]},
    bcdf: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1], [3, 1]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 3], [1, 0], [1, 0]], // BCD
    [[2, 3], [1, -3]], // DE
    [[2, 3], [1, 0]] // DF
  ]);
  test.deepEqual(topology.objects.bcde, {type: "LineString", arcs: [0, 1]});
  test.deepEqual(topology.objects.bcdf, {type: "LineString", arcs: [0, 2]});
  test.end();
});

//
// A                 E
//  \               /
//   \             /
//    \           /
//     \         /
//      \       /
//       C-----D
//
tape("topology the lines ACDE and CD share three arcs", function(test) {
  var topology = topojson.topology({
    acde: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 0]]},
    cd: {type: "LineString", coordinates: [[1, 1], [2, 1]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 3]], // AC
    [[1, 3], [1, 0]], // CD
    [[2, 3], [1, -3]] // DE
  ]);
  test.deepEqual(topology.objects.acde, {type: "LineString", arcs: [0, 1, 2]});
  test.deepEqual(topology.objects.cd, {type: "LineString", arcs: [1]});
  test.end();
});

//
// A                 E
//  \               /
//   \             /
//    \           /
//     \         /
//      \       /
// B-----C-----D
//
tape("topology the lines ACDE and BCD share four arcs", function(test) {
  var topology = topojson.topology({
    acde: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 0]]},
    bcd: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 3]], // AC
    [[1, 3], [1, 0]], // CD
    [[2, 3], [1, -3]], // DE
    [[0, 3], [1, 0]] // BC
  ]);
  test.deepEqual(topology.objects.acde, {type: "LineString", arcs: [0, 1, 2]});
  test.deepEqual(topology.objects.bcd, {type: "LineString", arcs: [3, 1]});
  test.end();
});

//
// A                 E
//  \               /
//   \             /
//    \           /
//     \         /
//      \       /
//       C-----D-----F
//
tape("topology the lines ACDE and CDF share four arcs", function(test) {
  var topology = topojson.topology({
    acde: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 0]]},
    cdf: {type: "LineString", coordinates: [[1, 1], [2, 1], [3, 1]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 3]], // AC
    [[1, 3], [1, 0]], // CD
    [[2, 3], [1, -3]], // DE
    [[2, 3], [1, 0]] // CF
  ]);
  test.deepEqual(topology.objects.acde, {type: "LineString", arcs: [0, 1, 2]});
  test.deepEqual(topology.objects.cdf, {type: "LineString", arcs: [1, 3]});
  test.end();
});

//
// A                 E
//  \               /
//   \             /
//    \           /
//     \         /
//      \       /
// B-----C-----D-----F
//
tape("topology the lines ACDE and BCDF share five arcs", function(test) {
  var topology = topojson.topology({
    acde: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 0]]},
    bcdf: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1], [3, 1]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 3]], // AC
    [[1, 3], [1, 0]], // CD
    [[2, 3], [1, -3]], // DE
    [[0, 3], [1, 0]], // BC
    [[2, 3], [1, 0]] // DF
  ]);
  test.deepEqual(topology.objects.acde, {type: "LineString", arcs: [0, 1, 2]});
  test.deepEqual(topology.objects.bcdf, {type: "LineString", arcs: [3, 1, 4]});
  test.end();
});

//
// A                 E
//  \               /
//   \             /
//    \           /
//     \         /
//      \       /
//       C-----D-----F
//
tape("topology the lines ACDE, EDCA and ACDF share three arcs", function(test) {
  var topology = topojson.topology({
    acde: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 0]]},
    edca: {type: "LineString", coordinates: [[3, 0], [2, 1], [1, 1], [0, 0]]},
    acdf: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 1]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 3], [1, 0]], // ACD
    [[2, 3], [1, -3]], // DE
    [[2, 3], [1, 0]] // DF
  ]);
  test.deepEqual(topology.objects.acde, {type: "LineString", arcs: [0, 1]});
  test.deepEqual(topology.objects.acdf, {type: "LineString", arcs: [0, 2]});
  test.deepEqual(topology.objects.edca, {type: "LineString", arcs: [~1, ~0]});
  test.end();
});

//
// A                 E
//  \               /
//   \             /
//    \           /
//     \         /
//      \       /
//       C-----D-----F
//
tape("topology the lines ACDE, ACDF and EDCA share three arcs", function(test) {
  var topology = topojson.topology({
    acde: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 0]]},
    acdf: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 1]]},
    edca: {type: "LineString", coordinates: [[3, 0], [2, 1], [1, 1], [0, 0]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 3], [1, 0]], // ACD
    [[2, 3], [1, -3]], // DE
    [[2, 3], [1, 0]] // DF
  ]);
  test.deepEqual(topology.objects.acde, {type: "LineString", arcs: [0, 1]});
  test.deepEqual(topology.objects.acdf, {type: "LineString", arcs: [0, 2]});
  test.deepEqual(topology.objects.edca, {type: "LineString", arcs: [~1, ~0]});
  test.end();
});

//
// A                 E
//  \               /
//   \             /
//    \           /
//     \         /
//      \       /
// B-----C-----D-----F
//
tape("topology the lines ACDE, ACDF, BCDE and BCDF and their reversals share five arcs", function(test) {
  var topology = topojson.topology({
    acde: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 0]]},
    acdf: {type: "LineString", coordinates: [[0, 0], [1, 1], [2, 1], [3, 1]]},
    bcde: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1], [3, 0]]},
    bcdf: {type: "LineString", coordinates: [[0, 1], [1, 1], [2, 1], [3, 1]]},
    edca: {type: "LineString", coordinates: [[3, 0], [2, 1], [1, 1], [0, 0]]},
    fdca: {type: "LineString", coordinates: [[3, 1], [2, 1], [1, 1], [0, 0]]},
    edcb: {type: "LineString", coordinates: [[3, 0], [2, 1], [1, 1], [0, 1]]},
    fdcb: {type: "LineString", coordinates: [[3, 1], [2, 1], [1, 1], [0, 1]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 3]], // AC
    [[1, 3], [1, 0]], // CD
    [[2, 3], [1, -3]], // DE
    [[2, 3], [1, 0]], // DF
    [[0, 3], [1, 0]] // BC
  ]);
  test.deepEqual(topology.objects.acde, {type: "LineString", arcs: [0, 1, 2]});
  test.deepEqual(topology.objects.acdf, {type: "LineString", arcs: [0, 1, 3]});
  test.deepEqual(topology.objects.bcde, {type: "LineString", arcs: [4, 1, 2]});
  test.deepEqual(topology.objects.bcdf, {type: "LineString", arcs: [4, 1, 3]});
  test.deepEqual(topology.objects.edca, {type: "LineString", arcs: [~2, ~1, ~0]});
  test.deepEqual(topology.objects.fdca, {type: "LineString", arcs: [~3, ~1, ~0]});
  test.deepEqual(topology.objects.edcb, {type: "LineString", arcs: [~2, ~1, ~4]});
  test.deepEqual(topology.objects.fdcb, {type: "LineString", arcs: [~3, ~1, ~4]});
  test.end();
});

//
// A-----B-----E
// |     |     |
// |     |     |
// |     |     |
// |     |     |
// |     |     |
// D-----C-----F
//
tape("topology the polygons ABCDA and BEFCB share three arcs", function(test) {
  var topology = topojson.topology({
    abcda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
    befcb: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]]}
  }, 3);
  test.deepEqual(topology.arcs, [
    [[1, 0], [0, 2]], // BC
    [[1, 2], [-1, 0], [0, -2], [1, 0]], // CDAB
    [[1, 0], [1, 0], [0, 2], [-1, 0]] // BEFC
  ]);
  test.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0, 1]]});
  test.deepEqual(topology.objects.befcb, {type: "Polygon", arcs: [[2, ~0]]});
  test.end();
});

//
// A-----B
// |\    |
// | \   |
// |  \  |
// |   \ |
// |    \|
// D-----C
//
tape("topology the polygons ABCDA and ABCA share three arcs", function(test) {
  var topology = topojson.topology({
    abcda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]}
  }, 2);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 0], [0, 1]], // ABC
    [[1, 1], [-1, 0], [0, -1]], // CDA
    [[1, 1], [-1, -1]] // CA
  ]);
  test.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0, 1]]});
  test.deepEqual(topology.objects.abca, {type: "Polygon", arcs: [[0, 2]]});
  test.end();
});

//
//             C
//            / \
//           /   \
//          /     \
//         /       \
//        /         \
// A-----B-----------D-----E
//
tape("topology the lines ABCDE and ABDE share two arcs", function(test) {
  var topology = topojson.topology({
    abcde: {type: "LineString", coordinates: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]},
    abde: {type: "LineString", coordinates: [[0, 0], [1, 0], [3, 0], [4, 0]]}
  }, 5);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 0]], // AB
    [[1, 0], [1, 0], [1, 0]], // BCD
    [[3, 0], [1, 0]], // DE
    [[1, 0], [2, 0]] // BD
  ]);
  test.deepEqual(topology.objects.abcde, {type: "LineString", arcs: [0, 1, 2]});
  test.deepEqual(topology.objects.abde, {type: "LineString", arcs: [0, 3, 2]});
  test.end();
});

//
// A-----B
// |\    |\
// | \   | \
// |  \  |  \
// |   \ |   \
// |    \|    \
// D-----C-----F
//
tape("topology the polygons ABCA, ACDA and BFCB share five arcs", function(test) {
  var topology = topojson.topology({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]},
    acda: {type: "Polygon", coordinates: [[[0, 0], [1, 1], [0, 1], [0, 0]]]},
    bfcb: {type: "Polygon", coordinates: [[[1, 0], [2, 1], [1, 1], [1, 0]]]}
  }, 3);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 0]], // AB
    [[1, 0], [0, 2]], // BC
    [[1, 2], [-1, -2]], // CA
    [[1, 2], [-1, 0], [0, -2]], // CDA
    [[1, 0], [1, 2], [-1, 0]] // BFC
  ]);
  test.deepEqual(topology.objects.abca, {type: "Polygon", arcs: [[0, 1, 2]]});
  test.deepEqual(topology.objects.acda, {type: "Polygon", arcs: [[~2, 3]]});
  test.deepEqual(topology.objects.bfcb, {type: "Polygon", arcs: [[4, ~1]]});
  test.end();
});

//
// A-----B-----E
//  \    |     |\
//   \   |     | \
//    \  |     |  \
//     \ |     |   \
//      \|     |    \
//       C-----F-----G
//
tape("topology the polygons ABCA, BEFCB and EGFE share six arcs", function(test) {
  var topology = topojson.topology({
    abca: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]},
    befcb: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]]},
    egfe: {type: "Polygon", coordinates: [[[2, 0], [3, 1], [2, 1], [2, 0]]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[1, 0], [0, 3]], // BC
    [[1, 3], [-1, -3], [1, 0]], // CAB
    [[1, 0], [1, 0]], // BE
    [[2, 0], [0, 3]], // EF
    [[2, 3], [-1, 0]], // FC
    [[2, 0], [1, 3], [-1, 0]] // EGF
  ]);
  test.deepEqual(topology.objects.abca, {type: "Polygon", arcs: [[0, 1]]});
  test.deepEqual(topology.objects.befcb, {type: "Polygon", arcs: [[2, 3, 4, ~0]]});
  test.deepEqual(topology.objects.egfe, {type: "Polygon", arcs: [[5, ~3]]});
  test.end();
});

//
// A-----B-----E
// |     |     |
// |     |     |
// D-----C     |
// |           |
// |           |
// G-----------F
//
tape("topology the polygons ABCDA, ABEFGDA and BEFGDCB share three arcs", function(test) {
  var topology = topojson.topology({
    abcda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
    abefgda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [2, 0], [2, 2], [0, 2], [0, 1], [0, 0]]]},
    befgdcb: {type: "Polygon", coordinates: [[[1, 0], [2, 0], [2, 2], [0, 2], [0, 1], [1, 1], [1, 0]]]}
  }, 3);
  test.deepEqual(topology.arcs, [
    [[1, 0], [0, 1], [-1, 0]], // BCD
    [[0, 1], [0, -1], [1, 0]], // DAB
    [[1, 0], [1, 0], [0, 2], [-2, 0], [0, -1]] // BEFGD
  ]);
  test.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0, 1]]});
  test.deepEqual(topology.objects.abefgda, {type: "Polygon", arcs: [[2, 1]]});
  test.deepEqual(topology.objects.befgdcb, {type: "Polygon", arcs: [[2, ~0]]});
  test.end();
});

//
// A-----B
// |     |
// |     |
// D-----C
//
tape("topology the polygons ABCDA and BCDAB share one arc", function(test) {
  var topology = topojson.topology({
    abcda: {type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
    bcdab: {type: "Polygon", coordinates: [[[1, 0], [1, 1], [0, 1], [0, 0], [1, 0]]]}
  }, 2);
  test.deepEqual(topology.arcs, [
    [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]
  ]);
  test.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0]]});
  test.deepEqual(topology.objects.bcdab, {type: "Polygon", arcs: [[0]]});
  test.end();
});

//
// A-----------------B
// |                 |
// |                 |
// |     E-----F     |
// |     |     |     |
// |     |     |     |
// |     H-----G     |
// |                 |
// |                 |
// D-----------------C
//
tape("topology the polygons ABCDA-EHGFE and EFGHE share two arcs", function(test) {
  var topology = topojson.topology({
    abcda: {type: "Polygon", coordinates: [[[0, 0], [3, 0], [3, 3], [0, 3], [0, 0]], [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]},
    efghe: {type: "Polygon", coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [3, 0], [0, 3], [-3, 0], [0, -3]], // ABCDA
    [[1, 1], [0, 1], [1, 0], [0, -1], [-1, 0]] // EHGFE
  ]);
  test.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0], [1]]});
  test.deepEqual(topology.objects.efghe, {type: "Polygon", arcs: [[~1]]});
  test.end();
});

//
// A-----------------B
// |                 |
// |                 |
// |     E-----F     |
// |     |     |     |
// |     |     |     |
// |     H-----G     |
// |                 |
// |                 |
// D-----------------C
//
tape("topology the polygons ABCDA-EHGFE and FGHEF share two arcs", function(test) {
  var topology = topojson.topology({
    abcda: {type: "Polygon", coordinates: [[[0, 0], [3, 0], [3, 3], [0, 3], [0, 0]], [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]},
    fghef: {type: "Polygon", coordinates: [[[2, 1], [2, 2], [1, 2], [1, 1], [2, 1]]]}
  }, 4);
  test.deepEqual(topology.arcs, [
    [[0, 0], [3, 0], [0, 3], [-3, 0], [0, -3]], // ABCDA
    [[1, 1], [0, 1], [1, 0], [0, -1], [-1, 0]] // EHGFE
  ]);
  test.deepEqual(topology.objects.abcda, {type: "Polygon", arcs: [[0], [1]]});
  test.deepEqual(topology.objects.fghef, {type: "Polygon", arcs: [[~1]]});
  test.end();
});

//
//    C-----D
//     \   /
//      \ /
// A-----B-----E
//
tape("topology the polygon BCDB and the line string ABE share three arcs", function(test) {
  var topology = topojson.topology({
    abe: {type: "LineString", coordinates: [[0, 1], [2, 1], [4, 1]]},
    bcdb: {type: "Polygon", coordinates: [[[2, 1], [1, 0], [3, 0], [2, 1]]]}
  }, 5);
  test.deepEqual(topology.arcs, [
    [[0, 4], [2, 0]], // AB
    [[2, 4], [2, 0]], // BE
    [[2, 4], [-1, -4], [2, 0], [-1, 4]] // BCDB
  ]);
  test.deepEqual(topology.objects.abe, {type: "LineString", arcs: [0, 1]});
  test.deepEqual(topology.objects.bcdb, {type: "Polygon", arcs: [[2]]});
  test.end();
});
