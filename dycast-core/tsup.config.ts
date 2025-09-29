import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js'
    };
  },
  splitting: false,
  sourcemap: true,
  target: 'es2020',
  platform: 'node',
  external: ['jsdom', 'ws', 'fs', 'path', 'vm', 'node-fetch']
});