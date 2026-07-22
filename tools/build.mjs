import { build } from "esbuild";

const buildOptions = {
  entryPoints: ["website/assets/js/app.js"],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  outfile: "website/bundle.js",
  sourcemap: true,
  minify: true,
  legalComments: "none",
  logLevel: "info",
};

await build(buildOptions);