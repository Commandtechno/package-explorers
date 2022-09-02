const esbuild = require("esbuild");

const dev = process.argv[2] === "dev";

esbuild.build({
  entryPoints: ["./src/index.html", "./src/styles.css", "./src/index.jsx"],
  outdir: "./build",
  jsxFactory: "__jsx",
  jsxFragment: "__fragment",
  loader: {
    ".html": "copy",
    ".svg": "file"
  },
  bundle: true,
  minify: !dev,
  watch: dev && {
    onRebuild(error, result) {
      if (error) console.error("watch build failed:", error);
      else console.log("watch build succeeded");
    }
  }
});