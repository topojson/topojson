# TopoJSON

<a href="http://bl.ocks.org/4090870"><img src="/mbostock/topojson/wiki/example.png" width="960" height="500" alt="U.S. County mesh"></a>

TopoJSON is an extension of GeoJSON that encodes topology. It facilitates geometry simplification that preserves topology (connectedness) for adjacent features using a technique inspired by [Matt Bloch’s MapShaper](http://mapshaper.com/test/MapShaper.swf). Moreover, by eliminating redundancy, TopoJSON is substantially more compact than GeoJSON. For example, the above shapefile of U.S. counties is 2.2M as a GeoJSON file, but only [436K](http://bl.ocks.org/4090870) as a boundary mesh, a reduction of 80.4%—without additional simplification.

TopoJSON allows related geometries to be stored efficiently in the same file; for example, a single TopoJSON file can contain both state and county polygons without duplicating coordinates for each. Furthermore, if the TopoJSON file is simplified, the state and county boundaries will remain consistent. As another example, a TopoJSON file can efficiently represent both polygons (for fill) and internal boundaries (for stroke) as two feature collections that share the same coordinate mesh.

TopoJSON uses fixed-precision delta-encoding for integer coordinates, rather than floats. This reduces file size, eliminating the need to round the precision of coordinate values, without sacrificing accuracy. Like GeoJSON, TopoJSON files are easily modified in a text editor and amenable to gzip compression.

## Implementation

TopoJSON introduces a new object type, "Topology". A Topology has an array `objects` which can contain either features or geometry objects, and an array `arcs`. Each *arc* is a sequence of coordinates; thus, a single arc is equivalent to a LineString's coordinates, and the array of arcs is equivalent to a MultiLineString's coordinates. The arcs are stitched together to form the geometry, rather than storing the geometry on each object separately.

As such, geometry objects differ from the GeoJSON specification in terms of how their coordinates are specified. Any geometry object contained inside a Topology defines its coordinates in terms of a sequence of the Topology's arcs, referenced by zero-based index. For example, a LineString geometry might be defined as

```js
{"type": "LineString", "coordinates": [42]}
```

where *42* refers to the arc `topology.arcs[42]`. If multiple arcs need to be concatenated:

```js
{"type": "LineString", "coordinates": [42, 43]}
```

Similarly, a Polygon with a hole might be defined as

```js
{"type": "Polygon", "coordinates": [[42, 43], [44]]}
```

When stitching together arcs to form geometries, the last coordinate of the arc must be the same as the first coordinate of the subsequent arc, if any. Thus, for all arcs except the last arc, the last coordinate of the arc should be skipped while rendering. For example, if arc 42 represents the point sequence A → B → C, and arc 43 represents the point sequence C → D → E, then the line string [42, 43] represents the point sequence A → B → C → D → E.

A negative index indicates that the sequence of coordinates in the arc should be reversed before stitching. To avoid ambiguity with zero, the two's complement is used; -1 (~0) represents the reversed arc 0, -2 (~1) represents the reversed arc 1, and so on.

A Topology has an array `arcs` which is an array of line strings. Each point in the line string is specified at least two dimensions: x and y. Each coordinate is represented as an integer value relative to the previous point, or relative to the origin ⟨0,0⟩ for the first point. To convert to latitude and longitude (or absolute coordinates), the topology also defines a `transform`. For example:

```js
"transform": {
  "scale": [0.035896033450880604, 0.005251163636665131],
  "translate": [-179.14350338367416, 18.906117143691233]
}
```

To convert from relative integer coordinates to fixed integer coordinates, keep a running sum while iterating over the arc. To convert from fixed integer coordinates to absolute coordinates, use the following expression:

```js
function fixedToAbsolute(point) {
  return [
    point[0] * transform.scale[0] + transform.translate[0],
    point[1] * transform.scale[1] + transform.translate[1]
  ];
}
```

An optional z-dimension can be used for dynamic simplification; the visual importance of the given control point as computed by the simplification algorithm (e.g., Visvalingham) is stored in TopoJSON so that the geometry can be rapidly simplified as needed for different zoom levels.

## Under Consideration

* Make feature `properties` optional; alternatively prefer using `id` on geometry objects.
* How to represent Points? (MultiPoint could reference a line string.) In what situations would points be affected by topology-preserving simplification?
