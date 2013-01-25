require("../topojson");

console.log(JSON.stringify({
  "name": "topojson",
  "version": topojson.version,
  "description": "An extension to GeoJSON that encodes topology.",
  "keywords": [
    "geojson",
    "shapefile"
  ],
  "author": {
    "name": "Mike Bostock",
    "url": "http://bost.ocks.org/mike"
  },
  "repository": {
    "type": "git",
    "url": "http://github.com/mbostock/topojson.git"
  },
  "main": "./index.js",
  "dependencies": {
    "optimist": "0.3.5"
  },
  "devDependencies": {
    "vows": "0.6.x"
  },
  "bin": {
    "topojson": "./bin/topojson"
  },
  "scripts": {
    "test": "./node_modules/vows/bin/vows; echo"
  }
}, null, 2));
