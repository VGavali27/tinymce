// Copies the self-hosted TinyMCE npm package into /public so it is served
// as static assets (no Tiny Cloud CDN, no apiKey needed).
// Runs automatically after every `npm install` (see package.json -> "postinstall").
//
// Works in CommonJS projects too: rename to postinstall.cjs and switch the
// imports to `const fse = require('fs-extra'); const path = require('path');`
// and replace `import.meta.dirname` with `__dirname`.
import fse from 'fs-extra';
import path from 'path';

const topDir = import.meta.dirname;

fse.emptyDirSync(path.join(topDir, 'public', 'tinymce'));
fse.copySync(
  path.join(topDir, 'node_modules', 'tinymce'),
  path.join(topDir, 'public', 'tinymce'),
  { overwrite: true }
);

console.log('Copied tinymce -> public/tinymce');
