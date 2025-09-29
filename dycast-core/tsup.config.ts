import { defineConfig } from 'tsup';

export default defineConfig([
  // Browser build (main entry point)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
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
    platform: 'browser',
    external: ['ws'] // ws is only used in server.ts
  },
  // Server-only build
  {
    entry: ['src/server-only.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: false,
    outDir: 'dist',
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.js'
      };
    },
    splitting: false,
    sourcemap: true,
    target: 'es2020',
    platform: 'node'
  }
]);