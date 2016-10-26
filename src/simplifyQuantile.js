import descending from "./descending";
import presimplify from "./presimplify";
import {simplify} from "./simplify";
import quantile from "./quantile";

export default function(topology, options) {
  var minimumQuantile = 0,
      areas = [];

  if (options)
    "minimum-quantile" in options && (minimumQuantile = +options["minimum-quantile"]);

  presimplify(topology, options);

  topology.arcs.forEach(function(arc) {
    arc.forEach(function(point) {
      if (isFinite(point[2])) { // Ignore endpoints, whose weight is Infinity.
        areas.push(point[2]);
      }
    });
  });

  return simplify(topology, areas.length && quantile(areas.sort(descending), minimumQuantile));
}
