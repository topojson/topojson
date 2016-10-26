import planar from "./planar";
// TODO import spherical from "./spherical";

export default function(name) {
  switch (name + "") {
    case "planar": return planar;
  }
};
