# TopoJSON

**TopoJSON** is an extension of GeoJSON that encodes topology. Rather than representing geometries discretely, geometries in TopoJSON files are stitched together from shared line segments called *arcs*. This technique is similar to [Matt Bloch’s MapShaper](http://www.cartogis.org/docs/proceedings/2006/bloch_harrower.pdf
) and the [Arc/Info Export format, .e00](http://indiemaps.com/blog/2009/02/e00parser-an-actionscript-3-parser-for-the-arcinfo-export-topological-gis-format/).

TopoJSON eliminates redundancy, allowing related geometries to be stored efficiently in the same file. For example, the shared boundary between California and Nevada is represented only once, rather than being duplicated for both states. A single TopoJSON file can contain multiple feature collections without duplication, such as states and counties. Or, a TopoJSON file can efficiently represent both polygons (for fill) and boundaries (for stroke) as two feature collections that share the same arc mesh. See [How To Infer Topology](https://bost.ocks.org/mike/topology/) for a visual explanation of how TopoJSON works.

To further reduce file size, TopoJSON can use quantized delta-encoding for integer coordinates. This is similar to rounding coordinate values (e.g., [LilJSON](https://github.com/migurski/LilJSON)), but with greater efficiency and control over loss of information. And like GeoJSON, TopoJSON files are easily modified in a text editor and amenable to gzip compression.

As a result, TopoJSON is substantially more compact than GeoJSON, frequently offering a reduction of 80% or more even without simplification. Yet encoding topology also has numerous useful applications for maps and visualization above! It allows [topology-preserving shape simplification](https://github.com/topojson/topojson-simplify), which ensures that adjacent features remain connected after simplification; this applies even across feature collections, such as simultaneous consistent simplification of state and county boundaries. Topology can also be used for [Dorling](http://www.ncgia.ucsb.edu/projects/Cartogram_Central/types.html) or [hexagonal cartograms](http://pitchinteractive.com/latest/tilegrams-more-human-maps/), as well as other techniques that need shared boundary information such as [automatic map coloring](https://bl.ocks.org/4188334).

## Installing

If you use NPM, `npm install topojson`. Otherwise, download the [latest release](https://github.com/topojson/topojson/releases/latest). You can also load directly from [unpkg](https://unpkg.com). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `topojson` global is exported:

```html
<script src="https://unpkg.com/topojson@2"></script>
<script>

var topology = topojson.topology({foo: geojson});

</script>
```

[Try topojson in your browser.](https://tonicdev.com/npm/topojson)

## API Reference

<a name="topology" href="#topology">#</a> topojson.<b>topology</b>(<i>objects</i>[, <i>quantization</i>])

Converts the specified [GeoJSON *objects*](http://geojson.org/geojson-spec.html#geojson-objects) to TopoJSON. The input *objects* are modified **in-place** and should not be referenced after calling this method; this is a destructive operation!

If a *quantization* parameter is specified, the input geometry is quantized prior to computing the topology, and the returned topology is quantized, and its arcs are [delta-encoded](https://github.com/topojson/topojson-specification/blob/master/README.md#213-arcs). Quantization is recommended to improve the quality of the topology if the input geometry is messy (*i.e.*, small floating point error means that adjacent boundaries do not have identical values); typical values are powers of ten, such as 1e4, 1e5 or 1e6. See also [topojson.quantize](https://github.com/topojson/topojson-client/blob/master/README.md#quantize) to quantize a topology after it has been constructed, without altering the topological relationships.

## Command-Line Reference

### geo2topo

<a name="geo2topo" href="#geo2topo">#</a> <b>geo2topo</b> [<i>options…</i>] &lt;<i>name</i>=<i>file</i>&gt;… [<>](https://github.com/topojson/topojson/blob/master/bin/geo2topo "Source")

Converts one or more GeoJSON objects to an output topology. For example, to convert the us-states.json GeoJSON FeatureCollection to a TopologyJSON topology with the “states” object in us.json:

```
geo2topo states=us-states.json > us.json
```

For convenience, you can omit the object name and specify only the file *name*; the object name will be the basename of the file, with the directory and extension removed. For example, to convert the states.json GeoJSON FeatureCollection to a TopologyJSON topology with the “states” object in us.json:

```
geo2topo states.json > us.json
```

See also [topo2geo](https://github.com/topojson/topojson-client/blob/master/README.md#topo2geo).

<a name="geo2topo_help" href="#geo2topo_help">#</a> geo2topo <b>-h</b>
<br><a href="#geo2topo_help">#</a> geo2topo <b>--help</b>

Output usage information.

<a name="geo2topo_version" href="#geo2topo_version">#</a> geo2topo <b>-V</b>
<br><a href="#geo2topo_version">#</a> geo2topo <b>--version</b>

Output the version number.

<a name="geo2topo_newline_delimited" href="#geo2topo_newline_delimited">#</a> geo2topo <b>-n</b>
<br><a href="#geo2topo_newline_delimited">#</a> geo2topo <b>--newline-delimited</b>

Output [newline-delimited JSON](http://ndjson.org/), with one feature per line.

<a name="geo2topo_in" href="#geo2topo_in">#</a> geo2topo <b>-i</b> <i>file</i>
<br><a href="#geo2topo_in">#</a> geo2topo <b>--in</b> <i>file</i>

Specify the input TopoJSON file name. Defaults to “-” for stdin.

<a name="geo2topo_list" href="#geo2topo_list">#</a> geo2topo <b>-l</b>
<br><a href="#geo2topo_list">#</a> geo2topo <b>--list</b>

List the names of the objects in the input topology, and then exit. For example, this:

```
geo2topo -l < us.json
```

Will output this:

```
counties
states
nation
```
