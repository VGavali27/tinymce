import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  {
    input: 'src/editor/editorConfig.js',
    output: [
      { file: 'dist/editorConfig.esm.js', format: 'esm', sourcemap: true },
      { file: 'dist/editorConfig.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
    ],
    external: ['@tinymce/tinymce-react'],
    plugins: [nodeResolve(), commonjs(), string({ include: ['**/*.css'] })],
  },
  {
    input: 'src/editor/trackChangesOptions.js',
    output: [
      { file: 'dist/trackChangesOptions.esm.js', format: 'esm', sourcemap: true },
      { file: 'dist/trackChangesOptions.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
    ],
    external: [],
    plugins: [nodeResolve(), commonjs(), string({ include: ['**/*.css'] })],
  },
  {
    input: 'src/trackchanges/trackchanges.js',
    output: [
      { file: 'dist/trackchanges.esm.js', format: 'esm', sourcemap: true },
      { file: 'dist/trackchanges.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
    ],
    plugins: [nodeResolve(), commonjs()],
  },
]);
