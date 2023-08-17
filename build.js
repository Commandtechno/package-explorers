const { readFile } = require('fs/promises')
const { optimize } = require('svgo')
const { resolve } = require('path');

const esbuild = require("esbuild");
const esbuildMacros = require("esbuild-plugin-macros");

const dev = process.argv[2] === "dev";

esbuild.build({
  entryPoints: ["./src/index.html", './src/index.jsx', './src/styles.css'],
  outdir: "./build",
  jsxFactory: "__jsx",
  jsxFragment: "__fragment",
  loader: { ".svg": "file", '.html': 'copy' },
  format: "esm",
  bundle: true,
  minify: !dev,
  watch: dev && {
    onRebuild(error, result) {
      if (error) console.error("watch build failed:", error);
      else console.log("watch build succeeded");
    }
  },
  plugins: [esbuildMacros, {
    name: 'svg',
    setup(build) {
      build.onResolve({ filter: /\.svg$/ }, args => ({ path: resolve(args.resolveDir, args.path), namespace: 'svg' }));
      build.onLoad({ filter: /.*/, namespace: 'svg' }, async args => {
        const contents = await readFile(args.path, 'utf8');
        return {
          contents: optimize(contents).data,
          loader: 'file',
        };
      });
    }
  }]
});
