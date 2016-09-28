import mesh, {meshArcs} from "./src/mesh";
import merge, {mergeArcs} from "./src/merge";
import feature from "./src/feature";
import neighbors from "./src/neighbors";
import presimplify from "./src/presimplify";

export {mesh, meshArcs, merge, mergeArcs, feature, neighbors, presimplify}

// Note: this is only here to help out folks who used
// to rely on doing import topojson from 'topojson'.
export default {
	mesh: mesh,
	meshArcs: meshArcs,
	merge: merge,
	mergeArcs: mergeArcs,
	feature: feature,
	neighbors: neighbors,
	presimplify: presimplify
}