# Portable self-hosted TinyMCE 8 (GPL) — copy-ready kit

Drop this folder into any project to get the same editor as this repo: the free
`tinymce` npm package served from your own domain (no Tiny Cloud CDN, no
`apiKey`, no editor-load metering), a blog toolbar, and the tightened toolbar
chrome (visible group dividers, row dividers, footer line).

| File | Purpose |
| --- | --- |
| `postinstall.js` | Copies `node_modules/tinymce` → `public/tinymce` on every `npm install`. |
| `tinymce.config.js` | `TINYMCE_SRC`, `BLOG_PLUGINS`, `BLOG_TOOLBAR`, `BLOG_INIT`. |
| `tinymce.overrides.css` | Toolbar/divider/padding overrides for the oxide skin. |
| `BlogEditor.jsx` | Minimal React example wiring all of the above together. |

---

## 1. Install

```bash
npm i tinymce @tinymce/tinymce-react
npm i -D fs-extra          # only needed for the postinstall copy step
```

Versions this kit was written and verified against:

- `tinymce@8.9.3`
- `@tinymce/tinymce-react@6.3.1`
- React 19

## 2. Serve the library yourself

Self-hosting means the browser loads TinyMCE from *your* origin. The simplest
way is to copy the package into the static/public directory after install.

1. Copy `postinstall.js` to the **project root**.
2. Add the hook to `package.json`:

```json
{
  "scripts": {
    "postinstall": "node ./postinstall.js"
  }
}
```

3. Ignore the copy (never commit it):

```gitignore
# Self-hosted TinyMCE copied from node_modules by postinstall.js
/public/tinymce/
```

4. Run it once:

```bash
npm run postinstall
```

You should now have `public/tinymce/tinymce.min.js`. Since `public/` is served at
the web root, the file is reachable at **`/tinymce/tinymce.min.js`** — that is
what `TINYMCE_SRC` points at.

> **Not using Vite?** Any framework with a "public"/"static" directory works —
> just change the destination in `postinstall.js` and update `TINYMCE_SRC` to
> match the served URL.
>
> **Deploying?** `postinstall` runs on install, so build pipelines (Netlify,
> Vercel, CI) get the copy automatically as long as `public/tinymce` is
> generated *before* the build step.

## 3. Add the config

Copy `tinymce.config.js` into your project (e.g. next to your editor component)
and import it. It exports:

- `TINYMCE_SRC` — the script URL from step 2.
- `BLOG_PLUGINS` — 27 free plugins only.
- `BLOG_TOOLBAR` — 12 groups joined with `' | '` (each separator becomes a
  vertical divider).
- `BLOG_INIT` — the full `init` object, including `promotion: false` and
  `branding: false` to remove the TinyMCE upsells.

## 4. Render the editor

Copy `BlogEditor.jsx` (React) — or use the vanilla equivalent:

```js
import './tinymce.overrides.css';

tinymce.init({
  selector: '#my-editor',
  base_url: '/tinymce',       // where tinymce.min.js + skin/plugins live
  suffix: '.min',
  license_key: 'gpl',         // free for self-hosted use under GPLv2+
  ...BLOG_INIT,               // spread the shared config (or paste it inline)
});
```

```html
<script src="/tinymce/tinymce.min.js"></script>
<div id="my-editor"></div>
```

The React props map 1:1 to the options:

| React prop | init option |
| --- | --- |
| `tinymceScriptSrc={TINYMCE_SRC}` | `base_url` / script tag |
| `licenseKey="gpl"` | `license_key: 'gpl'` |
| `init={BLOG_INIT}` | the `init` object |
| `initialValue` | initial HTML |
| `onInit={(_e, editor) => …}` | `setup`-style editor handle |

## 5. Add the styling

Import `tinymce.overrides.css` once (this kit imports it from `BlogEditor.jsx`).
It is **not required** for the editor to work — it only makes the toolbar
dividers visible, tightens the rows, and adds the footer line.

Two things to know:

- **Global scope.** The rules apply to every editor on the page — no wrapper
  class needed. The row height is hard-pinned to `34px`, so keep to normal
  button rows (no tall `--lg` labels) in every toolbar config. To limit the
  rules to a single editor instead, wrap it in an element with a class of your
  own and prefix each selector — see the header comment in the CSS file.
- **Specificity.** TinyMCE injects its skin CSS into `<head>` *after* your
  stylesheet, so equal-specificity rules lose. The file therefore uses slightly
  more specific selectors plus a few `!important`s. If you upgrade TinyMCE
  across minor versions, re-check these rules against the new
  `skins/ui/oxide/skin.css`.

---

## Gotchas

- **`toolbar_mode: 'wrap'` + a single string.** `BLOG_TOOLBAR` must stay one
  string. Passing an array makes TinyMCE emit one `.tox-toolbar` per entry
  (wrapped in `.tox-toolbar-overlord`), and the row-divider CSS no longer
  matches.
- **Config is read once, at mount.** Changing `init` does not hot-reload the
  editor. Hard refresh (`Ctrl+Shift+R`).
- **Don't commit `public/tinymce`.** It is a copy of `node_modules`; it can be
  many MB and goes stale silently. The `.gitignore` entry in step 2 covers it.
- **License.** Self-hosted use under the GPLv2+ is free: no API key, no load or
  domain caps. `licenseKey="gpl"` / `license_key: 'gpl'` acknowledges it. If you
  cannot ship under GPL, you need a commercial TinyMCE license instead — the
  config here is otherwise unchanged.
- **Premium features.** The plugin list deliberately excludes everything from
  the premium/Tiny Cloud set (e.g. `ai`, `comments`, `revisionhistory`,
  `powerpaste`, `casechange`, `formatpainter`, `linkchecker`, `mentions`), since
  those are not part of the free `tinymce` package. `src/data/premium.js` in
  this repo lists all 30 of them.

## Snapshot

`tinymce.config.js` and `tinymce.overrides.css` are snapshots of
`src/AddBlog.jsx` and the toolbar block at the end of `src/App.css` in this
repo. If you change the config here in `portable/`, change it there too — or
just re-copy from `src/` when you port it again.
