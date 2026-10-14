# Portable self-hosted TinyMCE 8 (GPL) — copy-ready kit

Drop this folder into any project to get the same editor as this repo: the free
`tinymce` npm package served from your own domain (no Tiny Cloud CDN, no
`apiKey`, no editor-load metering), a blog toolbar, and the tightened toolbar
chrome (visible group dividers, row dividers, footer line).

| File | Purpose |
| --- | --- |
| `postinstall.js` | Copies `node_modules/tinymce` → `public/tinymce` on every `npm install`. |
| `tinymce.config.js` | `TINYMCE_SRC`, `BLOG_PLUGINS`, `BLOG_TOOLBAR`, `BLOG_INIT` (+ the image upload handler). |
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
- `BLOG_PLUGINS` — all **28** free plugins (everything the package ships except
  `autoresize`).
- `BLOG_TOOLBAR` — **15 groups** joined with `'|'`, i.e. **42 buttons** (each
  separator becomes a vertical divider).
- `BLOG_INIT` — the full `init` object: **52 options**, including
  `promotion: false` and `branding: false` to remove the TinyMCE upsells, the
  image/upload options, formatting presets, table settings and accessibility
  options, plus a **`mobile`** section (see the gotchas below).

`imagesUploadHandler` is private to the file and wired in via
`BLOG_INIT.images_upload_handler`. It has to be a **function**, so it cannot
live in a JSON config — only a JS module like this one.

This file mirrors `src/AddBlog.jsx` in the source repo. To confirm the two have
not drifted, run the validator from the repo root:

```bash
node scripts/check-blog-config.mjs portable/tinymce.config.js
```

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
dividers visible, tightens the rows, adds the footer line, and stops the menu
bar from scrolling sideways on a phone.

Three things to know:

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
- **Menu bar below 480px.** The skin pins the menubar to one sideways-scrolling
  line (`skin.css:3275-3281`), which hides the last menus. The file lets it wrap
  onto a second line instead, using a (0,4,0) selector to beat the skin's
  (0,3,0) without `!important`.

---

## Gotchas

- **`toolbar_mode: 'wrap'` + a single string.** `BLOG_TOOLBAR` must stay one
  string. Passing an array makes TinyMCE emit one `.tox-toolbar` per entry
  (wrapped in `.tox-toolbar-overlord`), and the row-divider CSS no longer
  matches.
- **The toolbar is deliberately wide (42 buttons).** Under `toolbar_mode:
  'wrap'` it therefore wraps onto several rows. Switch to `'sliding'` to tuck
  the extras behind the ⋯ button, or trim `BLOG_TOOLBAR` to the groups you use.
- **A touch device ignores your top-level `menubar` and `toolbar_mode`.** The
  core substitutes its own values (`toolbar_mode: 'scrolling'`, and
  `menubar: false` on phones) *after* your options are applied, so the `mobile`
  section is the only place that can override them. That is why `BLOG_INIT`
  repeats the menubar there and sets `toolbar_mode: 'sliding'` — one row with a
  `⋯` button instead of a sideways-scrolling bar. The user agent is read once,
  at init, so a DevTools device change needs a hard refresh to take effect.
- **`extended_valid_elements` uses `p[*]`, not `p`.** A bare `p` means "allow
  `<p>` with *no* attributes", which silently strips `class`/`style`. The
  `style_formats` preset needs them: "Lead paragraph" sets `class="lead"` on a
  paragraph.
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

---

# Appendix: option reference

What every setting does, and — just as important — the **shape** of its value.
The "Here" column is the value used by this repo's Full editor
(`src/EditorFull.jsx`); the explanations apply to any TinyMCE 8 config.

Where this folder's `tinymce.config.js` differs, it is noted inline below. It
uses `height: 500` and `toolbar_mode: 'wrap'` (the Full editor uses `650` and
`'sliding'`), and it omits `autoresize` so `height` applies.

Several options use a compact custom syntax (`Label=value;Label=value`,
space-separated lists, flat hex/name arrays). See the
[format cheat-sheet](#format-cheat-sheet) at the end.

## The two constants: `ALL_PLUGINS` and `FULL_TOOLBAR`

Almost every table below refers back to two constants defined at the top of
`src/EditorFull.jsx`. Together they are what make this the *Full* editor: they
load every plugin and wire up every button.

```js
// Every plugin in the free/GPL build.
const ALL_PLUGINS = [
  'accordion', 'advlist', 'anchor', 'autolink', 'autoresize', 'autosave',
  'charmap', 'code', 'codesample', 'directionality', 'emoticons', 'fullscreen',
  'help', 'image', 'importcss', 'insertdatetime', 'link', 'lists', 'media',
  'nonbreaking', 'pagebreak', 'preview', 'quickbars', 'save', 'searchreplace',
  'table', 'visualblocks', 'visualchars', 'wordcount',
];

// A toolbar exposing every button the free plugins provide.
const FULL_TOOLBAR =
  'undo redo | blocks fontfamily fontsize lineheight | ' +
  'bold italic underline strikethrough | forecolor backcolor removeformat | ' +
  'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
  'ltr rtl | link unlink anchor image media table | ' +
  'charmap emoticons insertdatetime pagebreak nonbreaking hr | accordion codesample | ' +
  'searchreplace visualblocks visualchars code fullscreen preview | save help';
```

### `ALL_PLUGINS` — what it is and why

**What.** Each string is a plugin name passed to the `plugins` option. TinyMCE
resolves it to a folder — `plugins/<name>/plugin.min.js` — and fetches that file
at runtime. This is exactly why the `node_modules/tinymce` folder has to be
copied to `public/tinymce` (see `postinstall.js`): the browser requests those
files directly, so no bundler ever sees them.

**Why these 29.** They are *all* of the plugins in the free, self-hosted build.
The reason to load the complete set is that this app is a **reference**: it
exists to demonstrate what TinyMCE 8 can do, so leaving a plugin out would hide
a feature. The premium plugins (Tiny Comments, AI Assistant, PowerPaste, …) are
deliberately **absent** — they require a cloud key and would break the
`licenseKey="gpl"` / no-`apiKey` setup.

**Loading a plugin does not, on its own, show anything.** Enabling a plugin:

1. makes its **options** real (the ones in the tables below), and
2. **registers** its commands, buttons and toolbar items so they *become
   usable*.

But a registered button only appears if you also list it in `toolbar`. That is
the division of labour between the two constants: `ALL_PLUGINS` makes features
*available*, `FULL_TOOLBAR` makes them *visible*. Several plugins ship no
toolbar button at all and are still doing work:

| Plugin | What it adds without a toolbar button |
| --- | --- |
| `autolink` | Turns typed URLs/emails into links as you type. |
| `autoresize` | Grows the editor with its content. **Also overrides `height`** — drop it if you set a fixed height. |
| `autosave` | Drafts to `localStorage` on `autosave_interval`. |
| `importcss` | Adds page stylesheet classes to the Formats menu. |
| `wordcount` | The word/character counter in the status bar. |
| `quickbars` | The floating selection/insert toolbars. |
| `visualchars` | Shows non-printing characters (it has a button, but also an inline toggle). |

**Practical notes.** Order is irrelevant and duplicates are harmless. To trim
for production, delete the names you don't need. (The kit in this folder ships
this same full set, so trimming is a deliberate edit — not the default.) If a
plugin is missing, its buttons in `toolbar` simply don't render (and its options
are ignored).

### `FULL_TOOLBAR` — what it is and why

**What.** A single string passed to the `toolbar` option: button names separated
by spaces, and `|` to cut the bar into groups. The `+` string concatenation is
purely so it fits on screen in the source — at runtime it is one flat string.

**Why these groups.** The order follows the editing workflow, and each group
lines up with the plugins that supply it:

| Group | Provided by |
| --- | --- |
| `undo redo` | core |
| `blocks fontfamily fontsize lineheight` | core (entries come from `block_formats`, `font_family_formats`, …) |
| `bold italic underline strikethrough` | core |
| `forecolor backcolor removeformat` | core (colours come from `color_map`) |
| `alignleft aligncenter alignright alignjustify` | core |
| `bullist numlist outdent indent` | `lists` (+ core for outdent/indent) |
| `ltr rtl` | `directionality` |
| `link unlink anchor image media table` | `link`, `anchor`, `image`, `media`, `table` |
| `charmap emoticons insertdatetime pagebreak nonbreaking hr` | `charmap`, `emoticons`, `insertdatetime`, `pagebreak`, `nonbreaking` (+ core for `hr`) |
| `accordion codesample` | `accordion`, `codesample` |
| `searchreplace visualblocks visualchars code fullscreen preview` | `searchreplace`, `visualblocks`, `visualchars`, `code`, `fullscreen`, `preview` |
| `save help` | `save`, `help` |

The reason to include *every* button is the same as for `ALL_PLUGINS`: this is
the showcase configuration, so nothing is hidden. A real blog toolbar would keep
maybe a third of it — trimming `BLOG_TOOLBAR` is the first thing to do when you
port this.

**Two consequences worth knowing.** A bar this wide cannot fit on one line, so
it needs a `toolbar_mode` other than the default (`sliding` here). And remember
that `|` alone only creates separate `.tox-toolbar__group` elements — the
**visible line between the groups comes from the CSS** in
`tinymce.overrides.css`, because TinyMCE ships that border transparent and
exposes no option for it.

## Core

| Option | What it does | Here |
| --- | --- | --- |
| `height` | Total editor height, including menubar, toolbar and status bar. Number = px, or any CSS string (`'60vh'`). | `650` |
| `menubar` | Which menus to show, space-separated. `false` hides the whole bar. | `'file edit view insert format tools table help'` |
| `plugins` | Plugins to load. Each is fetched at runtime from `/tinymce/plugins/<name>/plugin.min.js`. | `ALL_PLUGINS` (29 names) |
| `toolbar` | Buttons to show, space-separated. `\|` splits them into groups. | `FULL_TOOLBAR` |
| `toolbar_mode` | Overflow handling: `floating`, `sliding`, `scrolling`, `wrap`. | `'sliding'` |

## Layout / behaviour

| Option | What it does | Here |
| --- | --- | --- |
| `resize` | Show the drag handle in the bottom-right. `true` = vertical, `'both'` = both axes. | `true` |
| `statusbar` | Show the bottom status bar. | `true` |
| `elementpath` | Show the tag path (e.g. `p › strong`) in the status bar. Needs `statusbar`. | `true` |
| `branding` | The "Powered by TinyMCE" text in the status bar. | `false` |
| `promotion` | TinyMCE's upgrade/promo UI. | `false` |
| `placeholder` | Grey hint text shown while the editor is empty. | `'Write your blog post…'` |
| `contextmenu` | Items in the right-click menu, space-separated, or `false`. | `'link image table'` |

## Image uploads (image plugin)

| Option | What it does | Here |
| --- | --- | --- |
| `automatic_uploads` | Upload pasted/dropped images immediately instead of embedding base64. | `true` |
| `image_uploadtab` | Show the "Upload" tab in the image dialog. Needs a working handler. | `true` |
| `image_advtab` | Show the "Advanced" tab (class, style, border, margins, spacing). | `true` |
| `image_title` | Add a "Title" field to the dialog. | `true` |
| `image_caption` | Wrap the image in `<figure>` + `<figcaption>` when caption text is entered. | `true` |
| `images_file_types` | Allowed extensions, comma-separated. Drives validation and the file picker. | `'jpeg,jpg,png,gif,webp,svg'` |
| `images_reuse_filename` | Keep the original filename (plus a unique suffix) instead of a random name. | `true` |
| `images_upload_handler` | **Your function**: receives the blob, returns a Promise resolving to the image URL. | `imagesUploadHandler` |

`image_uploadtab: true` **plus** a handler is the pair that makes the Upload tab
actually work — one without the other does nothing.

## Links (link plugin)

| Option | What it does | Here |
| --- | --- | --- |
| `link_default_target` | `target` applied to new links. | `'_blank'` |
| `link_assume_external_targets` | Bare domains like `example.com` get `http(s)://` added. | `true` |
| `link_context_toolbar` | Clicking a link pops a small floating toolbar (open / edit / unlink). | `true` |

## Media

| Option | What it does | Here |
| --- | --- | --- |
| `media_live_embeds` | Live iframe preview of embedded media inside the editor, instead of a placeholder. | `true` |

## Paste

| Option | What it does | Here |
| --- | --- | --- |
| `paste_data_images` | Accept pasted images (they arrive as base64 data URIs). Pairs with `automatic_uploads`. | `true` |
| `smart_paste` | Turn pasted plain text that looks like a URL into a link. | `true` |

## Formatting and styles

| Option | What it does | Here |
| --- | --- | --- |
| `block_formats` | Entries for the **blocks** dropdown. | Paragraph, Heading 1-4, Preformatted, Blockquote |
| `font_family_formats` | Entries for the **font family** dropdown. | System UI, Georgia, Times, Courier, Arial |
| `font_size_formats` | Entries for the **font size** dropdown. | `'12px 14px 16px 18px 24px 36px'` |
| `line_height_formats` | Entries for the **line height** dropdown. | `'1 1.2 1.5 2'` |
| `style_formats` | Custom entries for the **Formats** menu. Each needs `title` plus `block` or `inline`. | `Lead paragraph` (`.lead`), `Callout` (`.callout`), `Inline code` |
| `color_map` | Preset swatches for the text/background colour pickers. | 6 colours: Black, White, Red, Blue, Green, Amber |

## Code samples

| Option | What it does | Here |
| --- | --- | --- |
| `codesample_languages` | Entries in the codesample language dropdown. `value` must be a valid Prism language id. | markup, javascript, css, json, python |

## Autosave

| Option | What it does | Here |
| --- | --- | --- |
| `autosave_interval` | How often a draft is stored. Format `'30s'` / `'5m'`. | `'30s'` |

This saves to the **browser's** `localStorage`, not your server — a crash-recovery
safety net, not a publish mechanism.

## Quickbars (quickbars plugin)

The small toolbars that appear on their own.

| Option | What it does | Here |
| --- | --- | --- |
| `quickbars_selection_toolbar` | Shown when you select text. | `'bold italic \| link h2 h3 blockquote'` |
| `quickbars_insert_toolbar` | Shown on an empty line (insert image/table). | `'quickimage quicktable'` |

## Import CSS

| Option | What it does | Here |
| --- | --- | --- |
| `importcss_append` | The importcss plugin lists classes from the page's own stylesheets in the Formats menu. `append` = add to `style_formats` rather than replacing it. | `true` |

## Tables

| Option | What it does | Here |
| --- | --- | --- |
| `table_sizing_mode` | How table width is sized: `fixed`, `relative`, `responsive`, `auto`. | `'responsive'` |
| `table_toolbar` | Floating toolbar shown when the cursor is inside a table. | props, delete, row insert/delete, column insert/delete |

## Misc

| Option | What it does | Here |
| --- | --- | --- |
| `indent` | Enables the indent/outdent commands (the toolbar buttons, and Tab in lists). Default is already `true`. | `true` |
| `forced_root_block` | Element wrapping top-level content — makes Enter create `<p>` rather than bare text. | `'p'` |
| `newline_behavior` | What Enter does: `block`, `linebreak`, `invert`, `default`. | `'block'` |
| `directionality` | Default text direction for new blocks. | `'ltr'` |
| `content_language` | `lang` attribute put on the content (spellcheck, accessibility). | `'en'` |
| `a11y_advanced_options` | Adds accessibility fields to dialogs; the image plugin uses it for alt-text handling. | `true` |
| `xss_sanitization` | Runs TinyMCE's built-in HTML sanitizer on content in and out. **Keep `true`** — your main defence against stored XSS. | `true` |
| `deprecation_warnings` | Console warnings when deprecated options/APIs are used. | `true` |

## Format cheat-sheet

| Shape | Options |
| --- | --- |
| `Label=value` pairs, `;` separated | `block_formats`, `font_family_formats` |
| Space-separated list (`\|` = group split) | `toolbar`, `contextmenu`, `table_toolbar`, `quickbars_*` |
| Space-separated sizes/numbers | `font_size_formats`, `line_height_formats` |
| Flat hex/name array | `color_map` |
| Array of objects | `style_formats`, `codesample_languages` |
| Comma-separated extensions | `images_file_types` |
| A function | `images_upload_handler` |

The `|` group split creates separate `.tox-toolbar__group` elements, but the
**visible line between them requires the CSS** in `tinymce.overrides.css` —
TinyMCE ships it as `border-right: 1px solid transparent` and there is no option
for it.

## Notes specific to the Full editor config

- **`autoresize` overrides `height`.** If that plugin is in your plugin list,
  the editor sizes itself to its content and `height` is ignored. Remove
  `autoresize`, or use `min_height` / `max_height` instead.
- **`menubar: 'file edit view insert format tools table help'` is the default.**
  Writing it out, commenting it out, or omitting it all render the same bar.
  Use `menubar: false` to actually hide it.
- **`toolbar_mode: 'sliding'` is what shows the reveal/hide (⋯) button.** Use
  `'wrap'` to keep every button visible across rows instead.
- **`images_upload_handler` must be a function.** It cannot be expressed in JSON
  or a string, so it can't come from a config file loaded as data.
- **Config is read once, at mount.** Changing `init` does not hot-reload; hard
  refresh (`Ctrl+Shift+R`).
