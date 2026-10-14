// Validates a blog editor config against the installed self-hosted TinyMCE
// package: plugin names, option names and toolbar buttons.
//
// Defaults to src/AddBlog.jsx; pass a path to check another file that exports
// the same three constants, e.g. the portable kit:
//   node scripts/check-blog-config.mjs portable/tinymce.config.js
import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2] ?? 'src/AddBlog.jsx';
const jsx = fs.readFileSync(target, 'utf8');

// --- extract string constants (handles 'a' + 'b' concatenation) ---
const strings = (name) => {
  const block = jsx.match(new RegExp(`const ${name} =([\\s\\S]*?);\\n`))?.[1] ?? '';
  return [...block.matchAll(/'([^']*)'/g)].map((m) => m[1]).join(' ').trim();
};

const plugins = strings('BLOG_PLUGINS').split(/\s+/).filter(Boolean);
const toolbar = strings('BLOG_TOOLBAR')
  .split('|')
  .flatMap((row) => row.trim().split(/\s+/))
  .filter(Boolean);

const initBlock = jsx.match(/const BLOG_INIT = \{([\s\S]*?)\n\};/)?.[1] ?? '';
const optionKeys = [...initBlock.matchAll(/^\s{2}([a-z][a-zA-Z0-9_]*):/gm)].map(
  (m) => m[1]
);

// --- package data ---
const inv = JSON.parse(fs.readFileSync('scripts/option-inventory.json', 'utf8'));
const validOptions = new Set(inv.allCoreOptions);
for (const opts of Object.values(inv.pluginOptions)) {
  for (const o of opts) validOptions.add(o);
}

const installedPlugins = fs
  .readdirSync(path.join('node_modules', 'tinymce', 'plugins'))
  .filter((d) =>
    fs.existsSync(path.join('node_modules', 'tinymce', 'plugins', d, 'plugin.js'))
  );

// --- toolbar buttons: registry + well-known core/theme controls ---
const packageFiles = ['tinymce.js', 'themes/silver/theme.js'];
for (const p of installedPlugins) packageFiles.push(`plugins/${p}/plugin.js`);
const registered = new Set();
const re = /add(?:Toggle|Split|Group)?Button\(\s*'([^']+)'/g;
for (const f of packageFiles) {
  const src = fs.readFileSync(path.join('node_modules', 'tinymce', f), 'utf8');
  let m;
  while ((m = re.exec(src))) registered.add(m[1]);
}
// core/theme controls that are registered indirectly (loops) or nested menus
const CORE = new Set([
  'undo', 'redo', 'bold', 'italic', 'underline', 'strikethrough', 'superscript',
  'subscript', 'codeformat', 'removeformat', 'blocks', 'styles', 'fontfamily',
  'fontsize', 'lineheight', 'alignleft', 'aligncenter', 'alignright',
  'alignjustify', 'align', 'outdent', 'indent', 'bullist', 'numlist',
  'forecolor', 'backcolor', 'hr', 'ltr', 'rtl', 'link', 'unlink', 'anchor',
  'image', 'media', 'table', 'charmap', 'emoticons', 'insertdatetime',
  'pagebreak', 'nonbreaking', 'codesample', 'code', 'fullscreen', 'preview',
  'save', 'help', 'searchreplace', 'visualblocks', 'visualchars',
  'blockquote', 'selectall',
]);
const validButtons = new Set([...registered, ...CORE]);

// --- report ---
const problems = [];

for (const p of plugins) {
  if (!installedPlugins.includes(p)) problems.push(`plugin not installed: ${p}`);
}
for (const o of optionKeys) {
  if (!validOptions.has(o)) problems.push(`unknown option: ${o}`);
}
for (const b of toolbar) {
  if (!validButtons.has(b)) problems.push(`unknown toolbar button: ${b}`);
}

console.log(`file     : ${target}`);
console.log(`plugins  : ${plugins.length} (${plugins.join(' ')})`);
console.log(`options  : ${optionKeys.length} (${optionKeys.join(', ')})`);
console.log(`buttons  : ${toolbar.length}`);
console.log(
  problems.length ? `\nPROBLEMS:\n- ${problems.join('\n- ')}` : '\nAll config values are valid.'
);
process.exit(problems.length ? 1 : 0);
