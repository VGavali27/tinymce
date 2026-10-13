// Extracts every user-facing init option name from the installed tinymce
// type definitions, so the reference UI can never drift from the package.
import fs from 'node:fs';
import path from 'node:path';

const dts = fs.readFileSync(
  path.join('node_modules', 'tinymce', 'tinymce.d.ts'),
  'utf8'
);

function extract(interfaceName) {
  const re = new RegExp(
    `interface ${interfaceName}[^{]*\\{([\\s\\S]*?)\\n\\}`
  );
  const body = dts.match(re)?.[1] ?? '';
  const names = [];
  const lineRe = /^ {4}([a-z][a-zA-Z0-9_]*)\??:/gm;
  let m;
  while ((m = lineRe.exec(body))) names.push(m[1]);
  return names;
}

const options = [
  ...new Set([
    ...extract('BaseEditorOptions'),
    ...extract('RawEditorOptions'),
    ...extract('NormalizedEditorOptions'),
    ...extract('EditorOptions'),
  ]),
].sort();

console.error(`Total: ${options.length}`);

console.log(JSON.stringify(options, null, 2));
