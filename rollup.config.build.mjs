import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, '.build');

// Preprocess: copy src and strip ?raw from CSS imports
async function preprocess() {
  await fs.remove(buildDir);
  await fs.copy(path.join(__dirname, 'src'), buildDir);
  
  // Fix CSS raw imports
  const filesToFix = [
    path.join(buildDir, 'editor/trackChangesOptions.js'),
  ];
  
  for (const file of filesToFix) {
    if (await fs.pathExists(file)) {
      let content = await fs.readFile(file, 'utf8');
      content = content.replace(/\.css\?raw/g, '.css');
      await fs.writeFile(file, content);
    }
  }
}

await preprocess();

export default defineConfig([
  {
    input: path.join(buildDir, 'editor/editorConfig.js'),
    output: [
      { file: 'dist/editorConfig.esm.js', format: 'esm', sourcemap: true },
      { file: 'dist/editorConfig.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
    ],
    external: ['@tinymce/tinymce-react'],
    plugins: [nodeResolve(), commonjs(), string({ include: ['**/*.css'] })],
  },
  {
    input: path.join(buildDir, 'editor/trackChangesOptions.js'),
    output: [
      { file: 'dist/trackChangesOptions.esm.js', format: 'esm', sourcemap: true },
      { file: 'dist/trackChangesOptions.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
    ],
    external: [],
    plugins: [nodeResolve(), commonjs(), string({ include: ['**/*.css'] })],
  },
  {
    input: path.join(buildDir, 'trackchanges/trackchanges.js'),
    output: [
      { file: 'dist/trackchanges.esm.js', format: 'esm', sourcemap: true },
      { file: 'dist/trackchanges.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
    ],
    plugins: [nodeResolve(), commonjs()],
  },
  // Combined bundle for convenience
  {
    input: path.join(buildDir, 'editor/editorConfig.js'),
    output: [
      { file: 'dist/tinymce-trackchanges.esm.js', format: 'esm', sourcemap: true },
    ],
    external: ['@tinymce/tinymce-react'],
    plugins: [
      nodeResolve(), 
      commonjs(), 
      string({ include: ['**/*.css'] }),
    ],
  },
]);
