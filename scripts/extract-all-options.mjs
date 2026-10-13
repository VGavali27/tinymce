// Builds the complete option inventory for the self-hosted package by
// combining: tinymce.d.ts interfaces, core registerOption calls, the DOM
// model, the silver theme, and every plugin. Writes scripts/option-inventory.json
import fs from 'node:fs';
import path from 'node:path';

const root = path.join('node_modules', 'tinymce');

const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function fromDts() {
  const dts = read('tinymce.d.ts');
  const names = new Set();
  for (const iface of [
    'BaseEditorOptions',
    'RawEditorOptions',
    'NormalizedEditorOptions',
    'EditorOptions',
  ]) {
    const body =
      dts.match(new RegExp(`interface ${iface}[^{]*\\{([\\s\\S]*?)\\n\\}`))?.[1] ??
      '';
    const re = /^ {4}([a-z][a-zA-Z0-9_]*)\??:/gm;
    let m;
    while ((m = re.exec(body))) names.add(m[1]);
  }
  return names;
}

function registerOptions(src) {
  const names = new Set();
  const re = /registerOption\(\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
}

const core = registerOptions(read('tinymce.js'));
const model = registerOptions(read('models/dom/model.js'));

const themeDir = path.join(root, 'themes', 'silver');
const theme = new Set();
for (const f of fs.readdirSync(themeDir)) {
  if (f.endsWith('.js') && !f.endsWith('.min.js')) {
    for (const n of registerOptions(fs.readFileSync(path.join(themeDir, f), 'utf8')))
      theme.add(n);
  }
}

const pluginDir = path.join(root, 'plugins');
const plugins = {};
for (const d of fs.readdirSync(pluginDir, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const f = path.join(pluginDir, d.name, 'plugin.js');
  if (!fs.existsSync(f)) continue;
  plugins[d.name] = [...registerOptions(fs.readFileSync(f, 'utf8'))].sort();
}

const dts = fromDts();
const allCore = new Set([...dts, ...core, ...model, ...theme]);

const { OPTION_INFO } = await import('../src/data/editorOptions.js');
const documented = new Set(Object.keys(OPTION_INFO));

const inventory = {
  counts: {
    dts: dts.size,
    coreRegisterOption: core.size,
    model: model.size,
    theme: theme.size,
    unionCore: allCore.size,
    documented: documented.size,
    plugins: Object.keys(plugins).length,
  },
  documentedButNotInPackage: [...documented].filter((n) => !allCore.has(n)).sort(),
  inPackageButNotDocumented: [...allCore].filter((n) => !documented.has(n)).sort(),
  allCoreOptions: [...allCore].sort(),
  pluginOptions: plugins,
};

fs.writeFileSync(
  path.join('scripts', 'option-inventory.json'),
  JSON.stringify(inventory, null, 2)
);

console.log(JSON.stringify(inventory.counts, null, 2));
console.log('\nnot documented yet:\n' + inventory.inPackageButNotDocumented.join(', '));
console.log('\nin docs but not in package:\n' + (inventory.documentedButNotInPackage.join(', ') || 'none'));
