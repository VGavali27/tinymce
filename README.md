# TinyMCE self-hosted — React + Vite reference

A React + Vite app that demonstrates **every option and plugin available in the
self-hosted (GPL) build of TinyMCE 8**, using the `tinymce` npm package directly.
No Tiny Cloud, no `apiKey`, no CDN.

## What it shows

| Tab | Contents |
| --- | --- |
| **All options** | Searchable list of all **249** editor options supported by this version, grouped by category, each with a short description. |
| **Plugins** | The **29 free Community plugins** with their options, plus a separate list of the **30 premium** features that are *not* included in the free package. |
| **Full editor (all free plugins)** | A live editor with all 29 plugins enabled, a full toolbar, and image upload wired up (so the Upload tab appears). |
| **Default editor** | A minimal editor (`{ height: 500 }`) showing the out-of-the-box appearance. |

## Licensing

TinyMCE 8 self-hosted is licensed under **GPLv2 or later**. This project loads it
with `licenseKey="gpl"`. The public site that consumes the generated HTML has no
GPL obligation; the editor is used for authoring/admin only.

- No editor-load cap, no domain cap, no API key, no metering.
- Premium plugins (PowerPaste, Spell Checker, Accessibility Checker, AI, …) are
  **not** part of this package and would require a commercial license.

## Getting started

```bash
npm install      # also runs postinstall.js (copies TinyMCE into public/tinymce)
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the build
npm run lint     # oxlint
```

`postinstall.js` copies `node_modules/tinymce` to `public/tinymce`, which is
git-ignored. The editor is loaded from `/tinymce/tinymce.min.js` via
`tinymceScriptSrc`.

## Project layout

```
postinstall.js          # copies tinymce -> public/tinymce on install
src/
  App.jsx               # tab shell
  OptionsReference.jsx  # "All options" tab
  PluginsReference.jsx  # "Plugins" tab
  EditorFull.jsx        # full editor (all free plugins)
  EditorDemo.jsx        # minimal default editor
  data/
    editorOptions.js    # 249 options with category + description
    plugins.js          # 29 free plugins + their options
    premium.js          # 30 premium (not free) features
scripts/
  extract-options.mjs       # option names from tinymce.d.ts
  extract-plugin-options.mjs# plugin option names from registerOption calls
  extract-all-options.mjs   # full inventory -> option-inventory.json
  check-options.mjs         # verifies editorOptions.js vs the package
  check-plugins.mjs         # verifies plugins.js vs the package
```

## Verifying completeness

The option/plugin data is generated from the installed package, not hand-copied:

```bash
node scripts/extract-all-options.mjs
node scripts/check-options.mjs    # package 249 / documented 249 / missing none
node scripts/check-plugins.mjs    # All plugin options match.
```
