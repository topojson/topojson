# TopoJSON
**TopoJSON** とは地理空間情報をエンコードするためのフォーマットであるGeoJSON の拡張です。TopoJSON ファイル中の
ジオメトリは、個別に記述するのではなく *arcs* と呼ばれる共有行セグメントとしてまとめられています。TopoJSON は冗長性を
排し、GeoJSON よりずっとコンパクトなジオメトリの記述を可能とします。典型的な TopoJSON のファイルは、同じ内容の GeoJSON より
80% サイズが小さくなります。さらに、 TopoJSON を使うことで [topology-preserving shape simplification](http://bost.ocks.org/mike/simplify/) や [automatic map coloring](http://bl.ocks.org/4188334) 、 [cartograms](http://prag.ma/code/d3-cartogram/)のように地理空間情報を使ったアプリケーション作成を容易に行えるようになります。

詳しくは [ wiki ](/fod5/topojson/wiki/Home_jp) をご覧ください。

[[English]](https://github.com/mbostock/topojson/blob/master/README.md)