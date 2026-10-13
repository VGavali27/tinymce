// Dev check: verifies src/data/plugins.js lists exactly the plugin options the
// installed plugins register.
import fs from 'node:fs';
import { PLUGINS } from '../src/data/plugins.js';

const inv = JSON.parse(fs.readFileSync('scripts/option-inventory.json', 'utf8'));
const actual = inv.pluginOptions;

let problems = 0;
for (const plugin of PLUGINS) {
  const expected = (actual[plugin.name] ?? []).slice().sort();
  const listed = plugin.options.map((o) => o.name).sort();
  const missing = expected.filter((n) => !listed.includes(n));
  const extra = listed.filter((n) => !expected.includes(n));
  if (missing.length || extra.length) {
    problems++;
    console.log(
      `${plugin.name}: missing [${missing.join(', ')}] extra [${extra.join(', ')}]`
    );
  }
}

const known = new Set(PLUGINS.map((p) => p.name));
const unknown = Object.keys(actual).filter((n) => !known.has(n));
if (unknown.length) {
  problems++;
  console.log(`plugins not listed in data: ${unknown.join(', ')}`);
}

console.log(problems ? `\n${problems} problem(s)` : 'All plugin options match.');
process.exit(problems ? 1 : 0);
