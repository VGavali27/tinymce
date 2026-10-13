// Dev check: verifies src/data/editorOptions.js documents exactly the options
// the self-hosted package supports. Run scripts/extract-all-options.mjs first
// to refresh scripts/option-inventory.json.
import fs from 'node:fs';
import { OPTION_INFO } from '../src/data/editorOptions.js';

const inv = JSON.parse(
  fs.readFileSync('scripts/option-inventory.json', 'utf8')
);

const pkg = new Set(inv.allCoreOptions);
const documented = new Set(Object.keys(OPTION_INFO));

const missing = [...pkg].filter((n) => !documented.has(n)).sort();
const extra = [...documented].filter((n) => !pkg.has(n)).sort();

console.log(`package   : ${pkg.size}`);
console.log(`documented: ${documented.size}`);
console.log(`missing   : ${missing.length ? missing.join(', ') : 'none'}`);
console.log(`extra     : ${extra.length ? extra.join(', ') : 'none'}`);

process.exit(missing.length || extra.length ? 1 : 0);
