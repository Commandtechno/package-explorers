import { readFile } from 'fs/promises'
import { optimize } from 'svgo'
import { resolve } from 'path';

import esbuild from 'esbuild';
import esbuildMacros from 'esbuild-plugin-macros';
import esbuildHtmlMinify from 'esbuild-plugin-html-minify';

const dev = process.argv[2] === "dev";
const ctx = await esbuild.context({
  entryPoints: ["./src/index.html", './src/index.jsx', './src/styles.css'],
  outdir: "./build",
  jsxFactory: "__jsx",
  jsxFragment: "__fragment",
  loader: { ".svg": "file", '.html': 'copy' },
  format: "esm",
  bundle: true,
  sourcemap: true,
  minify: !dev,
  plugins: [esbuildMacros, esbuildHtmlMinify(), {
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

if (dev) {
  await ctx.watch();
  await ctx.serve()
  console.log('Listening on http://localhost:8000')
} else {
  await ctx.rebuild()
  process.exit()
}