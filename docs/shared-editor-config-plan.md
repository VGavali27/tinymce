# Shared TinyMCE editor config (reusable across pages)

Status: implemented. Owner: —. Related: `docs/track-changes-plan.md`.

## Goal

One source of truth for the editor `plugins`, `toolbar` and `init` options, so
pages (Add blog, Track changes, Playground, …) don't copy the big init object.
Track changes is **opt-in via a single flag**: pass `trackChanges: true` and the
toolbar group, marker styles and `setup` are added for you; omit it and they
aren't.

## Where it lives (new folders)

Shared config lives in a **new** `src/editor/` folder. It does not live in
`src/portable/` or `src/trackchanges/` — those are unchanged.

```
src/editor/
  editorConfig.js        # generic base: script URL, plugins, toolbar groups, init, builder
  trackChangesOptions.js # track-changes-only options; imports the core in src/trackchanges/
```

`trackChangesOptions.js` only *imports* the React-free core
(`src/trackchanges/trackchanges.js`) and its stylesheet — it does not add shared
data to that folder.

## Public API

`src/editor/editorConfig.js`

- `TINYMCE_SRC` — `/tinymce/tinymce.min.js` (self-hosted copy from
  `public/tinymce/`, produced by `postinstall.js`).
- `PLUGINS` — frozen array; the same list with or without track changes (track
  changes is core `setup`, not a plugin).
- `TOOLBAR_GROUPS` — frozen array of button groups, **without** the track
  changes group.
- `imagesUploadHandler` — in-browser upload so the image Upload tab works.
- `BASE_INIT` — every option shared by all pages.
- `createEditorInit(options)` — returns a **fresh** init object.
- `createEditorConfig(options)` — returns `{ tinymceScriptSrc, licenseKey, init }`,
  ready to spread onto `<Editor {...} />`.

`options` for the two builders:

| option | meaning |
|---|---|
| `trackChanges` | the single switch (default `false`) |
| `author` | author name passed to the track-changes core |
| `enabled` | start tracking on/off (default `true`) |
| `onStateChange` | callback `(isEnabled) => void`, fired from the toolbar button |
| `onSetup` | callback `(api, editor) => void`, receives the track-changes API |
| `setup` | optional extra `setup(editor, api)` to run after the internal one |
| `overrides` | object merged onto the base (height, placeholder, …) |

`src/editor/trackChangesOptions.js`

- `TRACK_CHANGES_TOOLBAR_GROUP` — `tctrack tcaccept tcreject tcacceptall tcrejectall tcaddcomment`
- `TRACK_CHANGES_QUICKBAR_ITEM` — `tcaddcomment`
- `TRACK_CHANGES_CONTENT_STYLE` — the marker CSS (`src/trackchanges/trackchanges.css`)
- `TRACK_CHANGES_VALID_ELEMENTS` — re-exported allow-list
- `createTrackChangesSetup(options)` — builds the `setup` callback
- `applyTrackChangesOptions(init, options)` — merges the tc bits into an init object

## How "just add track changes" works

The toolbar is `TOOLBAR_GROUPS` joined with `' | '`. When `trackChanges` is on,
the builder (not the caller) appends `TRACK_CHANGES_TOOLBAR_GROUP`, sets
`content_style`, extends `extended_valid_elements`, adds `tcaddcomment` to the
selection quickbar, and installs the tc `setup`.

The conditional is internal on purpose: the `tctrack`/`tcaccept`/… buttons only
exist after `setupTrackChanges` registers them, so referencing them without the
setup would log "unknown toolbar button" warnings.

## Rules / pitfalls

- Never mutate `BASE_INIT`; the builder always spreads into a new object. Pages
  may share `BASE_INIT` freely.
- Keep `src/editor/*` React-free: hosts pass callbacks, not React state.
- `author` / `enabled` are captured at init time (TinyMCE initialises once).
- When `trackChanges` is on, the tc `content_style` / `extended_valid_elements`
  win over anything in `overrides`.
- `initialValue` and page-specific `height`/`placeholder` stay on the page.

## Rollout

- `src/AddBlog.jsx` → `createEditorConfig()` (no track changes).
- `src/EditorTrackChanges.jsx` → `createEditorConfig({ trackChanges: true, … })`.
- `src/Playground.jsx` — uses the shared config, with a track-changes toggle.
- `src/EditorFull.jsx` / `src/EditorDemo.jsx` — out of scope for now (their
  toolbar/layout differ).

## Verification

- Lint (`npm run lint`) and build (`npm run build`).
- Both pages render the same toolbar/behaviour as before; the track-changes tab
  gains only the trailing tc group, and its toolbar toggle still drives the
  React label.
- Non-track-changes editors render no tc buttons and log no warnings.
