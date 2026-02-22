// ./bundle-cgi-worker.cjs

import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

// The bundler performs every operation needed to transform the project  into
// something that will run in the web browser.  It transpiles all the glue
// javascript into a single ESM javascript file and copies the actual web
// assembly binaries into the web root (i.e. the ./build directory).
//
// Storybook is configured to take the ./build directory and treat its contents
// as static assets and will move them into its own web root when it builds.
(async () => {

  await build({

    // The main entry point of the service worker.
    entryPoints: ['cgi-worker.mjs'],

    // The bundled service worker (this file is loaded by the web browser).
    outfile: 'build/cgi-worker.js',

    // The compilation target should be the browser environment.
    platform: 'browser',

    // Pack everything into a single output file.
    bundle: true,

    // Bundle to ESM format (not common-JS).
    format: 'esm',

    // No need to support ancient browsers.
    target: ['esnext'],

    // Any *.wasm or *.so urls should be treated as files.
    loader: {
      '.wasm': 'file',
      '.so':   'file'
    },

    // Lift all required wasm and shared object libraries.
    plugins: [
      copy({
        resolveFrom: 'cwd',
        assets: {
          from: ['./node_modules/php-cgi-wasm/*.{wasm,so}'],
          to: ['./build'],
        }
      }),
      copy({
        resolveFrom: 'cwd',
        assets: {
          from: ['./node_modules/php-wasm-mbstring/*.{wasm,so}'],
          to: ['./build'],
        }
      }),
      copy({
        resolveFrom: 'cwd',
        assets: {
          from: ['./node_modules/php-wasm-iconv/*.{wasm,so}'],
          to: ['./build'],
        }
      }),
    ],

    // Minify assets for bandwidth savings.
    minify: true,
  });
})();
