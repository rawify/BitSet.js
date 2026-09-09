import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';

import { build } from 'esbuild';

const entryPoint = 'src/bitset.ts';

await mkdir('dist', { recursive: true });

const shared = {
  bundle: true,
  entryPoints: [entryPoint],
  legalComments: 'inline',
  sourcemap: true,
  target: 'es2018',
};

await Promise.all([
  build({
    ...shared,
    format: 'esm',
    outfile: 'dist/bitset.mjs',
  }),
  build({
    ...shared,
    footer: {
      js: [
        'const BitSetExport = module.exports.default;',
        'Object.defineProperty(BitSetExport, "__esModule", { value: true });',
        'BitSetExport.default = BitSetExport;',
        'BitSetExport.BitSet = BitSetExport;',
        'module.exports = BitSetExport;',
      ].join('\n'),
    },
    format: 'cjs',
    outfile: 'dist/bitset.js',
    platform: 'node',
  }),
  build({
    ...shared,
    footer: {
      js: [
        'var BitSetExport = BitSetExports.default;',
        'if (typeof define === "function" && define.amd) define([], function () { return BitSetExport; });',
        'else (typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this).BitSet = BitSetExport;',
      ].join('\n'),
    },
    format: 'iife',
    globalName: 'BitSetExports',
    minify: true,
    outfile: 'dist/bitset.min.js',
    sourcemap: false,
  }),
  build({
    ...shared,
    format: 'esm',
    minify: true,
    outfile: 'dist/bitset.min.mjs',
    sourcemap: false,
  }),
]);

await copyFile('.types/bitset.d.ts', 'dist/bitset.d.mts');
await writeFile('dist/bitset.d.ts', [
  "import type { BitSet as BitSetType, BitSetConstructor, BitSetInput, ReadOnlyBitSet } from './bitset.d.mts';",
  '',
  'declare const BitSet: BitSetConstructor;',
  '',
  'declare namespace BitSet {',
  '  type BitSet = BitSetType;',
  '  type Constructor = BitSetConstructor;',
  '  type Input = BitSetInput;',
  '  type ReadOnly = ReadOnlyBitSet;',
  '}',
  '',
  'export = BitSet;',
  '',
].join('\n'));
await rm('.types', { recursive: true });