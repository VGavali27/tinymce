// Extracts every plugin option name (registerOption) from the installed
// tinymce plugins, grouped by plugin. Authoritative for this version.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join('node_modules', 'tinymce', 'plugins');
const plugins = fs
  .readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const out = {};
for (const name of plugins) {
  const file = path.join(dir, name, 'plugin.js');
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  const names = new Set();
  const re = /registerOption\(\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  out[name] = [...names].sort();
}

console.log(JSON.stringify(out, null, 2));
