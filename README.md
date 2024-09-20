# TopoJSON

**TopoJSON** is an extension of GeoJSON that encodes topology. Rather than representing geometries discretely, geometries in TopoJSON files are stitched together from shared line segments called *arcs*. This technique is similar to [Matt Bloch’s MapShaper](http://www.cartogis.org/docs/proceedings/2006/bloch_harrower.pdf) and the [Arc/Info Export format, .e00](https://web.archive.org/web/20140721114041/http://indiemaps.com:80/blog/2009/02/e00parser-an-actionscript-3-parser-for-the-arcinfo-export-topological-gis-format/).

TopoJSON eliminates redundancy, allowing related geometries to be stored efficiently in the same file. For example, the shared boundary between California and Nevada is represented only once, rather than being duplicated for both states. A single TopoJSON file can contain multiple feature collections without duplication, such as states and counties. Or, a TopoJSON file can efficiently represent both polygons (for fill) and boundaries (for stroke) as two feature collections that share the same arc mesh. See [How To Infer Topology](https://bost.ocks.org/mike/topology/) for a visual explanation of how TopoJSON works. See [Command-Line Cartography](https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c) for an introduction to TopoJSON and related tools. See [TopoJSON Format Specification](https://github.com/topojson/topojson-specification) for the format specification.

To further reduce file size, TopoJSON can use quantized delta-encoding for integer coordinates. This is similar to rounding coordinate values (e.g., [LilJSON](https://github.com/migurski/LilJSON)), but with greater efficiency and control over loss of information. And like GeoJSON, TopoJSON files are easily modified in a text editor and amenable to gzip compression.

As a result, TopoJSON is substantially more compact than GeoJSON, frequently offering a reduction of 80% or more even without simplification. Yet encoding topology also has numerous useful applications for maps and visualization above! It allows [topology-preserving shape simplification](https://github.com/topojson/topojson-simplify), which ensures that adjacent features remain connected after simplification; this applies even across feature collections, such as simultaneous consistent simplification of state and county boundaries. Topology can also be used for [Dorling](http://www.ncgia.ucsb.edu/projects/Cartogram_Central/types.html) or [hexagonal cartograms](https://pitchinteractiveinc.github.io/tilegrams/), as well as other techniques that need shared boundary information such as [automatic map coloring](https://bl.ocks.org/4188334).

## Installing

If you use NPM, `npm install topojson`. Otherwise, download the [latest release](https://github.com/topojson/topojson/releases/latest). You can also load directly from [d3js.org](https://d3js.org) as a [standalone library](https://unpkg.com/topojson@3). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `topojson` global is exported:

```html
<script src="https://unpkg.com/topojson@3"></script>
<script>

var topology = topojson.topology({foo: geojson});

</script>
```

[Try topojson in your browser.](https://tonicdev.com/npm/topojson)

## API Reference

### [Generation (topojson-server)](https://github.com/topojson/topojson-server)

* [topojson.topology](https://github.com/topojson/topojson-server/blob/master/README.md#topology) - convert GeoJSON to TopoJSON.
* [geo2topo](https://github.com/topojson/topojson-server/blob/master/README.md#geo2topo) - convert GeoJSON to TopoJSON.

### [Simplification (topojson-simplify)](https://github.com/topojson/topojson-simplify)

* [topojson.presimplify](https://github.com/topojson/topojson-simplify/blob/master/README.md#presimplify) - prepare TopoJSON for simplification.
* [topojson.simplify](https://github.com/topojson/topojson-simplify/blob/master/README.md#simplify) - simplify geometry by removing coordinates.
* [topojson.quantile](https://github.com/topojson/topojson-simplify/blob/master/README.md#quantile) - compute a simplification threshold.
* [topojson.filter](https://github.com/topojson/topojson-simplify/blob/master/README.md#filter) - remove rings from a topology.
* [topojson.filterAttached](https://github.com/topojson/topojson-simplify/blob/master/README.md#filterAttached) - remove detached rings.
* [topojson.filterAttachedWeight](https://github.com/topojson/topojson-simplify/blob/master/README.md#filterAttachedWeight) - remove small detached rings.
* [topojson.filterWeight](https://github.com/topojson/topojson-simplify/blob/master/README.md#filterWeight) - remove small rings.
* [topojson.planarRingArea](https://github.com/topojson/topojson-simplify/blob/master/README.md#planarRingArea) - compute the planar area of a ring.
* [topojson.planarTriangleArea](https://github.com/topojson/topojson-simplify/blob/master/README.md#planarTriangleArea) - compute the planar area of a triangle.
* [topojson.sphericalRingArea](https://github.com/topojson/topojson-simplify/blob/master/README.md#sphericalRingArea) - compute the spherical area of a ring.
* [topojson.sphericalTriangleArea](https://github.com/topojson/topojson-simplify/blob/master/README.md#sphericalTriangleArea) - compute the spherical area of a triangle.
* [toposimplify](https://github.com/topojson/topojson-simplify/blob/master/README.md#toposimplify) - simplify TopoJSON, removing coordinates.

### [Manipulation (topojson-client)](https://github.com/topojson/topojson-client)

* [topojson.feature](https://github.com/topojson/topojson-client/blob/master/README.md#feature) - convert TopoJSON to GeoJSON.
* [topojson.merge](https://github.com/topojson/topojson-client/blob/master/README.md#merge) - merge TopoJSON geometry and convert to GeoJSON polygons.
* [topojson.mergeArcs](https://github.com/topojson/topojson-client/blob/master/README.md#mergeArcs) - merge TopoJSON geometry to form polygons.
* [topojson.mesh](https://github.com/topojson/topojson-client/blob/master/README.md#mesh) - mesh TopoJSON geometry and convert to GeoJSON lines.
* [topojson.meshArcs](https://github.com/topojson/topojson-client/blob/master/README.md#meshArcs) - mesh TopoJSON geometry to form lines.
* [topojson.neighbors](https://github.com/topojson/topojson-client/blob/master/README.md#neighbors) - compute adjacent features.
* [topojson.bbox](https://github.com/topojson/topojson-client/blob/master/README.md#bbox) - compute the bounding box of a topology.
* [topojson.quantize](https://github.com/topojson/topojson-client/blob/master/README.md#quantize) - round coordinates, reducing precision.
* [topojson.transform](https://github.com/topojson/topojson-client/blob/master/README.md#transform) - remove delta-encoding and apply a transform.
* [topojson.untransform](https://github.com/topojson/topojson-client/blob/master/README.md#untransform) - apply delta-encoding and remove a transform.
* [topo2geo](https://github.com/topojson/topojson-client/blob/master/README.md#topo2geo) - convert TopoJSON to GeoJSON.
* [topomerge](https://github.com/topojson/topojson-client/blob/master/README.md#topomerge) - merge TopoJSON geometry, and optionally filter.
* [topoquantize](https://github.com/topojson/topojson-client/blob/master/README.md#topoquantize) - round TopoJSON, reducing precision.
