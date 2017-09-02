import ascii from "rollup-plugin-ascii";
import node from "rollup-plugin-node-resolve";

export default {
  input: "index",
  extend: true,
  plugins: [node(), ascii()],
  output: {
    file: "dist/topojson.js",
    format: "umd",
    name: "topojson"
  }
};
