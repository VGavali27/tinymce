# Track changes — implementation plan

Branch: `feature/track-changes`
Status: Phase 2 (insertions + deletions) implemented — awaiting browser verification

A free, self-hosted substitute for TinyMCE's premium `revisionhistory` /
`suggestededits` / `comments` plugins, built into this reference app first and
then extracted into a reusable kit (Phase 6).

---

## 1. Requirements

| Change | Visual | Hover |
| --- | --- | --- |
| Insertion | green text + green underline | `inserted by <username> – <datetime>` |
| Deletion | red text + red strikethrough | `deleted by <username> – <datetime>` |
| Comment | yellow background | `comment by <username> – <datetime>` + comment body |

## 2. Why we build it ourselves

Track changes and comments are **premium** in TinyMCE and are not part of the
free `tinymce` package (see `src/data/premium.js`: `revisionhistory`,
`suggestededits`, `comments`). The plan is a lightweight free equivalent.

## 3. Architecture

The editable content lives in an **iframe**. React only exchanges HTML strings
(`initialValue` / `setContent` in, `getContent` out), so any per-keystroke logic
must run **inside the editor**. The feature is therefore a custom TinyMCE
plugin (a `setup(editor)` module), not React code. React supplies config
(author identity) and reads the result.

## 4. Data model (markup)

| Change | Markup |
| --- | --- |
| Insertion | `<ins class="tc-insert" datetime="…ISO…" data-author="Vinod" data-tooltip="Inserted by …">text</ins>` |
| Deletion | `<del class="tc-delete" datetime="…ISO…" data-author="Vinod" data-tooltip="Deleted by …">text</del>` |
| Comment | `<span class="tc-comment" data-comment-id="c1" data-tooltip="Comment by …">anchor</span>` |

- `<ins>` / `<del>` are the native HTML elements for insertions/deletions and
  are allowed by TinyMCE's default schema with `datetime` / `cite`.
- Hover text is composed into `data-tooltip`.
- The comment **body** (and replies/resolved state) needs a store keyed by
  `data-comment-id`; it cannot live cleanly in an attribute.

## 5. Capture

- **Insertions** — intercept `beforeinput` (`insertText`, `insertFromPaste`),
  `preventDefault`, insert an `<ins>`-wrapped run, place the caret after it.
- **Deletions** — intercept the `beforeinput` delete types, `preventDefault`,
  wrap the target range in `<del>` instead of removing it, park the caret to
  one side.
- **Comments** — toolbar button / context menu over a selection: wrap in a
  `tc-comment` span, capture the body in a popover, persist the model.
- All custom mutations go through `editor.undoManager`.

## 6. Rendering & CSS

Content styles must be delivered **inside the iframe** via `content_css` (or
`content_style`) — the page CSS in `src/App.css` / `portable/tinymce.overrides.css`
does not reach the editable body. Markers carry their hover text in
`data-tooltip`; the core renders it as a single shared `.tc-tooltip` element in
the host page (not a CSS `::after`). That keeps the markers unpositioned so the
text caret is painted above their background — an opaque `::after`/`position:
relative` tooltip made the caret disappear inside commented text.

## 7. Lifecycle

- **Accept all** — unwrap `<ins>`, drop `<del>`.
- **Reject all** — drop `<ins>`, unwrap `<del>`.
- Per-change accept/reject (Phase 3+).
- **Clean export** — publish-ready HTML with all track-change markup stripped.

## 8. Identity, time, undo

- Author name/id passed in via init options; wired from the AddBlog **Author**
  field (fallback to a config default).
- Timestamp captured at edit time (ISO).
- Every mutation routed through `undoManager` so Ctrl+Z works.

## 9. Portability (the reusable kit)

Rules so the kit is drop-in like the existing `portable/` folder:

1. Core is **plain JS + CSS** — no React, no host imports, no build step.
2. Host-specific values are **inputs**: `trackchanges_author`,
   `trackchanges_author_id`, and a comment store interface.
3. One CSS file (`trackchanges.css`) loaded via `content_css`.
4. All options namespaced `trackchanges_*`.

Two consumption shapes: a **`setup` module** (bundler-friendly) or a **plugin
folder** in `public/tinymce/plugins/trackchanges/` (no bundler). Ship both from
the same source; the `setup` shape is the default.

Comment store sits behind `getAll` / `save` / `load`, defaulting to in-memory,
so a host with a backend swaps in their API without touching the rest.

## 10. Phases

| Phase | Deliverable |
| --- | --- |
| **1. Spike** ✅ | Prove the markup survives the serializer + `xss_sanitization`, and that `beforeinput` interception + caret placement works. |
| **2. Insertions + deletions** ✅ | Green/red markup, hover text, on/off toggle. |
| **3. Comments** | Yellow highlight, popover, hover text, margin markers. |
| **4. Accept/reject + clean export** | Accept-all, reject-all, publish-ready HTML. (Basic accept/reject-all already landed in Phase 2's core; per-change UI + clean export remain.) |
| **5. Docs in `src/`** | Design notes alongside the code. |
| **6. Extract to `portable/trackchanges/`** | The reusable kit + README + `scripts/check-blog-config.mjs` parity. |

## 11. Risks

- Caret/selection loss after `preventDefault`.
- IME/composition, paste, drag-drop, spellcheck replacements.
- Undo granularity (per word vs per character).
- TinyMCE sanitizer silently stripping our attributes.
- Overlapping ranges (comment over an insertion; deletion inside an insertion).
- Policy for Backspace on an existing `<del>` and on an `<ins>`.
- Performance on large documents — never re-render the whole doc per keystroke.

---

## Appendix A — Phase 1 static findings (tinymce 8.9.3)

Read from `node_modules/tinymce/tinymce.js` (dev build). These answer the spike
questions up front; the runnable harness in `spike/trackchanges-spike.html`
confirms them end-to-end in a browser.

| Question | Answer | Source |
| --- | --- | --- |
| Are `<ins>` / `<del>` allowed by default? | Yes — default HTML5 schema: `add('ins del', 'cite datetime', flowContent)`. | L4486 |
| Is `datetime` allowed on them? | Yes (same rule); `cite` too. | L4486 |
| Are arbitrary `data-*` attributes kept? | Yes — the attribute filter always keeps `data-*` and `aria-*`: `… \|\| startsWith(attrName, 'data-') \|\| startsWith(attrName, 'aria-')`. | L21652 |
| Does `xss_sanitization` strip them? | No — it is DOMPurify 3.4.12 with `ALLOW_DATA_ATTR = true` / `ALLOW_ARIA_ATTR = true`; `ins`/`del` and `datetime` are in DOMPurify's default allow-list. | L18679, L19274–19276, L19441–19442, L4486 |
| Is `beforeinput` delivered as an editor event? | Yes — `beforeinput`/`input` are in the native-events map and forwarded to `editor.on(...)`. | L39848–39851 |
| Can we cancel it? | Yes — the core fires `beforeinput` for deletes and checks `isDefaultPrevented()`; `preventDefault` suppresses the default action. | L28320–28321, L32949–32951 |
| Do we even need `extended_valid_elements`? | Not for `ins`/`del`/`datetime`/`data-*` (all default-allowed). Keep it anyway as an explicit, self-documenting allow-list. | — |

**Conclusion:** the markup and the interception mechanism are both viable; no
show-stoppers. The remaining work is the wrapping/caret logic (Phase 2).

## Appendix B — open decisions

1. v1 scope — insert+delete first, comments second (recommended) vs all three.
2. Comment body storage — attributes vs separate JSON vs backend interface.
3. Markup — semantic `ins`/`del` (recommended) vs uniform custom spans.

---

## Appendix C — Phase 2 implementation

Files (all new, `feature/track-changes`):

| File | Role |
| --- | --- |
| `src/trackchanges/trackchanges.js` | **React-free core.** `setupTrackChanges(editor, options)` returns an API; `TRACK_CHANGES_VALID_ELEMENTS` is the schema allow-list. |
| `src/trackchanges/trackchanges.css` | **Iframe-only content styles** (green `ins`, red `del`, yellow comment). Hover text comes from `data-tooltip`; the core renders it, so markers stay unpositioned. |
| `src/EditorTrackChanges.jsx` | Thin React host: author field, on/off toggle, accept/reject-all; injects the CSS via `content_style`. |
| `src/App.jsx` / `src/App.css` | New "Track changes" tab + page-chrome styles. |

### Core API

```js
const tc = setupTrackChanges(editor, {
  author: 'Vinod',            // or getAuthor: () => liveName
  enabled: true,
  classes: { insert, delete, comment },   // optional overrides
  labels:  { insert, delete, comment },   // optional tooltip verbs
});

tc.enable() / tc.disable() / tc.toggle() / tc.isEnabled()
tc.setAuthor(name)
tc.insertText(text)            // what beforeinput calls
tc.deleteSelection(forward)    // what beforeinput calls
tc.acceptAll() / tc.rejectAll()
tc.acceptChange() / tc.rejectChange()   // accept/reject the change at the caret
tc.destroy()
```

### Behaviour (v1)

- **Insert** — `beforeinput` `insertText` is cancelled; the run is wrapped in
  `<ins>` and the caret is parked at its end so consecutive typing **merges into
  one marker** rather than one element per keystroke.
- **Delete** — `deleteContentBackward/Forward` is cancelled:
  - backspace/delete over ordinary text wraps one character in `<del>` and
    **extends the same `<del>`** on repeat (adjacent same-author markers merge,
    keeping the older `datetime`);
  - deleting text that is *inside our own `<ins>`* **cancels the insertion**
    instead of striking it through.
- **Non-collapsed selection** — wrapped in one `<del>` (or cancelled if wholly
  inside an `<ins>`).
- **Accept all** — unwrap `<ins>`, drop `<del>`. **Reject all** — drop `<ins>`,
  unwrap `<del>`.
- Every mutation calls `undoManager.add()` + `setDirty` + `nodeChanged`.

### Known v1 limits (deliberate)

- IME/composition, paste, drag-drop, and word/line deletes go through natively
  (not tracked).
- A selection spanning block elements is wrapped in a single inline marker.
- Undo granularity is per mutation (roughly per keystroke).

### How to verify

1. `npm run dev`, open the app, choose the **Track changes** tab.
2. Type to add a green-underlined `<ins>`; hover it to check the "Inserted by"
   tooltip.
3. Backspace over text to add a red-struck `<del>`; hover for "Deleted by".
4. Select text and use the toolbar **Comment** button for a yellow highlight.
5. Use the toolbar track on/off and accept/reject (current and all) buttons.
3. Manually: type in the body (green underline, hover for author/time), move the
   caret and press Backspace (red strikethrough, grows on repeat), flip
   **Tracking: off** and confirm native typing resumes, then try Accept/Reject all.

`npm run lint` and `npm run build` are clean; `node --check` passes on the core.
