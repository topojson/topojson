      <select style="margin-left:1em;" onchange="location.href=this.options[ this.selectedIndex ].value;">
         <option value="http://mbostock.github.com/d3/tutorial/circle.html">英語</option>
         <option value="http://ja.d3js.node.ws/document/tutorial/circle.html" selected>日本語</option>
      </select>
# TopoJSON

**TopoJSON** is an extension of GeoJSON that encodes topology. Rather than representing geometries discretely, geometries in TopoJSON files are stitched together from shared line segments called *arcs*. TopoJSON eliminates redundancy, offering much more compact representations of geometry than with GeoJSON; typical TopoJSON files are 80% smaller than their GeoJSON equivalents. In addition, TopoJSON facilitates applications that use topology, such as [topology-preserving shape simplification](http://bost.ocks.org/mike/simplify/), [automatic map coloring](http://bl.ocks.org/4188334), and [cartograms](http://prag.ma/code/d3-cartogram/).

Want to learn more? [See the wiki.](/mbostock/topojson/wiki)
