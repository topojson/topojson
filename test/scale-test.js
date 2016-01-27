var vows = require("vows"),
    assert = require("./assert"),
    scale = require("../lib/topojson/scale");

var suite = vows.describe("scale");

suite.addBatch({
  "scale": {
    "with a quantized topology": {
      "scales to fit the width of the viewport": function() {
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 13, 17, 21], // 6:8 = 3:4
          transform: {scale: [1, 2], translate: [11, 13]} // [3,2] -> [14,17]
        }, {
          width: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 200, 266.666667], // 200:266.67 = 3:4
          transform: {scale: [33.333333, 66.666667], translate: [0, 0]} // [3,2] -> [100,133.33333]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 17, 17, 19], // 6:2 = 3:1
          transform: {scale: [1, 2], translate: [11, 13]} // [3,2.5] -> [14,18]
        }, {
          width: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 200, 66.666667], // 200:66.667 = 3:1
          transform: {scale: [33.3333333, 66.6666667], translate: [0, -133.333333]} // [3,2.5] -> [100,33.333333]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 17, 17, 19], // 6:2 = 3:1
          transform: {scale: [1, 2], translate: [11, 13]} // [3,2.5] -> [14,18]
        }, {
          width: 200,
          margin: 20,
          invert: false
        }), {
          type: "Topology",
          bbox: [20, 20, 180, 73.3333333], // 120:40 = 3:1
          transform: {scale: [26.666667, 53.333333], translate: [20, -86.6666667]} // [3,2.5] -> [80,40]
        });
      },
      "scales to fit the height of the viewport": function() {
        assert.inDelta(scale({
          type: "Topology",
          bbox: [13, 11, 21, 17], // 8:6 = 4:3
          transform: {scale: [2, 1], translate: [13, 11]} // [2,3] -> [17,14]
        }, {
          height: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 266.666667, 200], // 266:200.67 = 4:3
          transform: {scale: [66.666667, 33.333333], translate: [0, 0]} // [2,3] -> [133.33333,100]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [17, 11, 19, 17], // 2:6 = 1:3
          transform: {scale: [2, 1], translate: [13, 11]} // [2.5,3] -> [18,14]
        }, {
          height: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 66.666667, 200], // 66.667:200 = 1:3
          transform: {scale: [66.6666667, 33.3333333], translate: [-133.333333, 0]} // [2.5,3] -> [33.333333,100]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [17, 11, 19, 17], // 2:6 = 1:3
          transform: {scale: [2, 1], translate: [13, 11]} // [2.5,3] -> [18,14]
        }, {
          height: 200,
          margin: 20,
          invert: false
        }), {
          type: "Topology",
          bbox: [20, 20, 73.3333333, 180], // 40:120 = 1:3
          transform: {scale: [53.333333, 26.666667], translate: [-86.6666667, 20]} // [2.5,3] -> [40,80]
        });
      },
      "scales to fit the smaller side of the viewport": function() {
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 13, 17, 21], // 6:8 = 3:4
          transform: {scale: [1, 2], translate: [11, 13]} // [3,2] -> [14,17]
        }, {
          width: 190,
          height: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [20, 0, 170, 200], // 150:200 = 3:4
          transform: {scale: [25, 50], translate: [20, 0]} // [3,2] -> [95,100]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [13, 11, 21, 17], // 8:6 = 4:3
          transform: {scale: [2, 1], translate: [13, 11]} // [2,3] -> [17,14]
        }, {
          height: 190,
          width: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 20, 200, 170], // 200:150 = 4:3
          transform: {scale: [50, 25], translate: [0, 20]} // [2,3] -> [100,95]
        });
      },
      "returns the expected result when the original transform origin is not [xmin,ymin]": function() {
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 13, 17, 21], // 6:8 = 3:4
          transform: {scale: [1, 2], translate: [10, 11]} // [4,3] -> [14,17]
        }, {
          width: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 200, 266.666667], // 200:266.67 = 3:4
          transform: {scale: [33.333333, 66.666667], translate: [-33.333333, -66.666667]} // [4,3] -> [100,133.33333]
        });
      }
    },
    "with a non-quantized topology": {
      "scales to fit the width of the viewport": function() {
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 13, 17, 21], // 6:8 = 3:4
          arcs: [[[11, 13], [17, 21]]]
        }, {
          width: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 200, 266.666667], // 200:266.67 = 3:4
          arcs: [[[0, 0], [200, 266.666667]]]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 17, 17, 19], // 6:2 = 3:1
          arcs: [[[11, 17], [17, 19]]]
        }, {
          width: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 200, 66.666667], // 200:66.667 = 3:1
          arcs: [[[0, 0], [200, 66.666667]]]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 17, 17, 19], // 6:2 = 3:1
          arcs: [[[11, 17], [17, 19]]]
        }, {
          width: 160,
          margin: 20,
          invert: false
        }), {
          type: "Topology",
          bbox: [20, 20, 140, 60], // 120:40 = 3:1
          arcs: [[[20, 20], [140, 60]]]
        });
      },
      "scales to fit the height of the viewport": function() {
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 13, 17, 21], // 6:8 = 3:4
          arcs: [[[11, 13], [17, 21]]]
        }, {
          height: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 150, 200], // 150:200 = 3:4
          arcs: [[[0, 0], [150, 200]]]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 17, 17, 19], // 6:2 = 3:1
          arcs: [[[11, 17], [17, 19]]]
        }, {
          height: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 0, 600, 200], // 600:200 = 3:1
          arcs: [[[0, 0], [600, 200]]]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 17, 17, 19], // 6:2 = 3:1
          arcs: [[[11, 17], [17, 19]]]
        }, {
          height: 160,
          margin: 20,
          invert: false
        }), {
          type: "Topology",
          bbox: [20, 20, 380, 140], // 360:120 = 3:1
          arcs: [[[20, 20], [380, 140]]]
        });
      },
      "scales to fit the smaller side of the viewport": function() {
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 13, 17, 21], // 6:8 = 3:4
          arcs: [[[11, 13], [17, 21]]]
        }, {
          width: 190,
          height: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [20, 0, 170, 200], // 150:200 = 3:4
          arcs: [[[20, 0], [170, 200]]]
        });
        assert.inDelta(scale({
          type: "Topology",
          bbox: [13, 11, 21, 17], // 8:6 = 4:3
          arcs: [[[13, 11], [21, 17]]]
        }, {
          height: 190,
          width: 200,
          invert: false
        }), {
          type: "Topology",
          bbox: [0, 20, 200, 170], // 200:150 = 4:3
          arcs: [[[0, 20], [200, 170]]]
        });
      },
      "inverts by default": function() {
        assert.inDelta(scale({
          type: "Topology",
          bbox: [11, 13, 17, 21],
          arcs: [[[11, 13], [17, 21]]]
        }, {
          width: 200
        }), {
          type: "Topology",
          bbox: [0, 0, 200, 266.666667],
          arcs: [[[0, 266.666667], [200, 0]]]
        });
      }
    }
  }
});

suite.export(module);
