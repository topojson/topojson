var vows = require("vows"),
    assert = require("./assert"),
    topojson = require("../");

var suite = vows.describe("topojson.simplify");

// simplify() adds an "area" property to each point in an arc. We need to
// remove those properties to make assert.deepEqual() work.
function removeAreaFromArcs(arcs) {
  return arcs.map(function(arc) {
    return arc.map(function(p) {
      return p.slice(0);
    });
  });
}

suite.addBatch({
  "simplify": {
    topic: function() {
      return topojson.simplify;
    },
    "excess points are removed": function() {
      var topology = {
        transform: { scale: [ 1, 1 ], translate: [ 0, 0 ] },
        objects: {},
        arcs: [[
          // *
          // **
          // * *
          // *  *
          // *   *
          // *    *
          // *     *
          // *      *
          // *       *
          // *        *
          // *---__    **
          //       ````*
          //
          // We expect this to become a normal triangle.
          [0, 0],      // 0,0
          [10, 10],    // 10,10
          [0, 1],      // 10,11
          [1, -1],     // 11,10
          [-11, 0],   // 0,10
          [0, -10]     // 0,0
        ]]
      };
      topojson.simplify(topology, {
        "minimum-area": 2,
        "coordinate-system": "cartesian",
      });
      assert.deepEqual(
        removeAreaFromArcs(topology.arcs),
        [[[0, 0], [10, 10], [-10, 0], [0, -10]]]
      );
    },

    "empty arcs are removed": function() {
      var topology = {
        transform: { scale: [ 1, 1 ], translate: [ 0, 0 ] },
        objects: {},
        arcs: [[[ 50, 50 ], [1, 1], [-1, -1]]]
      };
      topojson.simplify(topology, {
        "minimum-area": 3,
        "coordinate-system": "cartesian"
      });
      assert.deepEqual(topology.arcs, []);
    },

    "arc IDs are rearranged when empty arcs are removed": function() {
      var topology = {
        transform: { scale: [ 1, 1 ], translate: [ 0, 0 ] },
        objects: {
          a: { type: "LineString", arcs: [ 0, 1, 2 ] }
        },
        arcs: [
          [[0, 0], [10, 0]],
          [[10, 0], [1, 1], [-1, -1]], // a useless arc which will be removed
          [[10, 0], [0, 10]]
        ]
      };
      topojson.simplify(topology, {
        "minimum-area": 1,
        "coordinate-system": "cartesian"
      });
      assert.deepEqual(topology.objects.a.arcs, [ 0, 1 ]);
    },

    "Geometries with no more arcs are removed": function() {
      var topology = {
        transform: { scale: [ 1, 1 ], translate: [ 0, 0 ] },
        objects: {
          a: { type: "GeometryCollection", geometries: [
          	{ type: "Polygon", arcs: [[ 0 ]] }
		  ]}
        },
        arcs: [
          [[10, 0], [1, 1], [-1, -1]] // a useless arc which will be removed
        ]
      };
      topojson.simplify(topology, {
        "minimum-area": 1,
        "coordinate-system": "cartesian"
      });
      assert.deepEqual(topology.objects, {});
    }
  }
});

suite.export(module);
