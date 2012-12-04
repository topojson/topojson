# TopoJSON

<a href="http://bl.ocks.org/4090870"><img src="/mbostock/topojson/wiki/example.png" width="960" height="500" alt="U.S. County mesh"></a>

TopoJSON is an extension of GeoJSON that encodes topology. Rather than representing geometries discretely, geometries in TopoJSON files are stitched together from shared line segments called *arcs*. This technique is similar to [Matt Bloch’s MapShaper](http://www.cartogis.org/docs/proceedings/2006/bloch_harrower.pdf
) and the [Arc/Info Export format, .e00](http://indiemaps.com/blog/2009/02/e00parser-an-actionscript-3-parser-for-the-arcinfo-export-topological-gis-format/).

TopoJSON eliminates redundancy, allowing related geometries to be stored efficiently in the same file. For example, the shared boundary between California and Nevada is represented only once, rather than being duplicated for both states. A single TopoJSON file can contain multiple feature collections without duplication, such as states and counties. Or, a TopoJSON file can efficiently represent both polygons (for fill) and boundaries (for stroke) as two feature collections that share the same arc mesh.

As a result, TopoJSON is substantially more compact than GeoJSON. The above shapefile of U.S. counties is 2.2M as a GeoJSON file, but only [436K](http://bl.ocks.org/4090870) as a boundary mesh, a reduction of 80.4% even without simplification. TopoJSON can also be more efficient to render since shared control points need only be projected once.

To further reduce file size, TopoJSON uses fixed-precision delta-encoding for integer coordinates rather than floats. This eliminates the need to round the precision of coordinate values (e.g., [LilJSON](https://github.com/migurski/LilJSON)), without sacrificing accuracy. Like GeoJSON, TopoJSON files are easily modified in a text editor and amenable to gzip compression.

Lastly, encoding topology has numerous useful applications for maps and visualization. It facilitates geometry simplification that preserves the connectedness of adjacent features; this applies even across feature collections, such as simultaneous consistent simplification of state and county boundaries. Topology can also be used for [Dorling cartograms](http://www.ncgia.ucsb.edu/projects/Cartogram_Central/types.html) and other techniques that need shared boundary information.

## Implementation

TopoJSON introduces a new container type: "Topology". A *topology* contains a map of named `objects`, which represent GeoJSON geometry objects such as polygons and multi-polygons, as well as geometry collections. The coordinates for these geometries are stored in the topology's `arcs` array. An *arc* is a sequence of points, similar to a line string's coordinates; the arcs are stitched together to form the geometry, rather than storing the coordinates for each object separately.

### Example

Here is a complete TopoJSON file with a single geometry object representing [Aruba](http://en.wikipedia.org/wiki/Aruba):

```js
{
  "type": "Topology",
  "transform": {
    "scale": [0.036003600360036005, 0.017361589674592462],
    "translate": [-180, -89.99892578124998]
  },
  "objects": {
    "aruba": {
      "type": "Polygon",
      "arcs": [[0]],
      "id": 533
    }
  },
  "arcs": [
    [[3058, 5901], [0, -2], [-2, 1], [-1, 3], [-2, 3], [0, 3], [1, 1], [1, -3], [2, -5], [1, -1]]
  ]
}
```

### Geometry Objects

Geometry objects in TopoJSON are identical to those in GeoJSON, except that a TopoJSON geometry object defines its coordinates as a sequence of the containing topology's arcs, referenced by zero-based index. For example, a line string might be defined as

```js
{"type": "LineString", "arcs": [42]}
```

where *42* refers to the arc `topology.arcs[42]`. Note that a line string's coordinates are defined as an array of arcs, rather than a single arc, so that multiple arcs can be concatenated to form the line string as necessary:

```js
{"type": "LineString", "arcs": [42, 43]}
```

Similarly, a polygon with a hole might be defined as

```js
{"type": "Polygon", "arcs": [[42, 43], [44]]}
```

When stitching together arcs to form geometries, the last coordinate of the arc must be the same as the first coordinate of the subsequent arc, if any. (Thus, for all arcs except the last arc, the last coordinate of the arc can be skipped while rendering.) For example, if arc 42 represents the point sequence A → B → C, and arc 43 represents the point sequence C → D → E, then the line string [42, 43] represents the point sequence A → B → C → D → E.

In some cases, a shared arc may need to be reversed. For example, the shared border between California and Nevada proceeds southwards on the California side, but northwards on the Nevada side. A negative index indicates that the sequence of coordinates in the arc should be reversed before stitching. To avoid ambiguity with zero, the two's complement is used; -1 (~0) represents the reversed arc 0, -2 (~1) represents the reversed arc 1, and so on.

Points and multi-point geometry objects are represented directly with coordinates, as in GeoJSON, rather than arcs. (In effect, points are not part of the topology.) However, these coordinates are still represented as fixed integers, and should be converted in the same fashion as arcs, as described next.

### Arcs and Coordinates

The topology's' `arcs` array is effectively an array of line strings. As in GeoJSON, each point in the line string is specified by at least two dimensions: *x* and *y*. However, unlike GeoJSON, each coordinate in TopoJSON is represented as an *integer* value relative to the previous point. The first point is relative to the origin, ⟨0,0⟩. To convert to latitude and longitude (or absolute coordinates), the topology defines a simple linear `transform` consisting of a scale and translate. For example:

```js
"transform": {
  "scale": [0.035896033450880604, 0.005251163636665131],
  "translate": [-179.14350338367416, 18.906117143691233]
}
```

To convert from relative integer coordinates to fixed integer coordinates, keep a running sum while iterating over the arc. To convert from fixed integer coordinates to absolute coordinates, scale each coordinate, and then add the appropriate translation. In code:

```js
function arcToCoordinates(topology, arc) {
  var x = 0, y = 0;
  return arc.map(function(point) {
    return [
      (x += point[0]) * topology.transform.scale[0] + topology.transform.translate[0],
      (y += point[1]) * topology.transform.scale[1] + topology.transform.translate[1]
    ];
  });
}
```

Arc coordinates may have additional dimensions. For example, to support for dynamic simplification at different zoom levels, the visual importance of each point as computed by a simplification algorithm (e.g., Visvalingham) can be stored along with each point so that arcs can be rapidly filtered as needed.

While GeoJSON is agnostic about winding order, TopoJSON requires that all sub-hemisphere polygons be in clockwise winding order; counterclockwise winding order indicates the polygon that covers an area greater than one hemisphere.

### Features

TopoJSON does not support GeoJSON features, nor feature collections. Instead, these objects are converted to their respective geometries and geometry collections. In addition, TopoJSON allows optional identifiers (`id`) and properties to be stored directly on geometry objects. This simplified representation is equivalent but can be encoded more efficiently.
