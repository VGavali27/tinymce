// ---------------------------------------------------------------------------
// Track changes — React-free core for self-hosted TinyMCE 8.
//
// Drop-in setup module: pass an editor and options, get back a small API.
// No React, no host imports, no build step required — the whole point is that
// this file can be copied into another project (see docs/track-changes-plan.md).
//
//   import { setupTrackChanges, TRACK_CHANGES_VALID_ELEMENTS } from './trackchanges.js';
//
//   tinymce.init({
//     ...,
//     extended_valid_elements: TRACK_CHANGES_VALID_ELEMENTS,
//     setup: (editor) => { editor.trackChanges = setupTrackChanges(editor, { getAuthor: () => 'Vinod' }); },
//   });
//
// Behaviour:
//   insertion  -> <ins class="tc-insert" datetime="…" data-author="…" data-tooltip="Inserted by …">…</ins>
//   deletion   -> <del class="tc-delete" datetime="…" data-author="…" data-tooltip="Deleted by …">…</del>
//   comment    -> <span class="tc-comment" data-comment-id="…" …>…</span>   (Phase 3)
//
// Known v1 limits (documented, not bugs):
//   * IME/composition input is left to the browser (not tracked).
//   * Paste / drop / word- and line-deletes are left to the browser.
//   * A selection spanning block elements is wrapped in a single marker.
// ---------------------------------------------------------------------------

// Same allow-list the spike proved out. TinyMCE keeps ins/del/datetime and all
// data-* attributes by default, so this is documentation as much as config.
const TRACK_CHANGES_VALID_ELEMENTS =
  'ins[datetime|data-author|data-author-id|data-tooltip|class],' +
  'del[datetime|data-author|data-author-id|data-tooltip|class],' +
  'span[data-comment-id|data-tooltip|class],' +
  'time[datetime]';

const DEFAULT_CLASSES = { insert: 'tc-insert', delete: 'tc-delete', comment: 'tc-comment' };
const DEFAULT_LABELS = { insert: 'Inserted by', delete: 'Deleted by', comment: 'Comment by' };
const DASH = ' \u2013 '; // en dash, matches the spec: "inserted by X - datetime"

// Human-readable timestamp in LOCAL time, e.g. "15/10/2026 01:29pm".
const formatDateTime = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso == null ? '' : iso);
  const pad = (n) => String(n).padStart(2, '0');
  const hours24 = d.getHours();
  const suffix = hours24 >= 12 ? 'pm' : 'am';
  const hours12 = hours24 % 12 || 12;
  return (
    pad(d.getDate()) +
    '/' +
    pad(d.getMonth() + 1) +
    '/' +
    d.getFullYear() +
    ' ' +
    pad(hours12) +
    ':' +
    pad(d.getMinutes()) +
    suffix
  );
};

const newCommentId = () =>
  'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);

const normalizeComment = (c) => ({
  id: String(c.id),
  author: String(c.author || 'Anonymous'),
  datetime: String(c.datetime || new Date().toISOString()),
  body: c.body == null ? '' : String(c.body),
});

function setupTrackChanges(editor, options = {}) {
  const conf = {
    // A live getter wins if supplied; otherwise api.setAuthor() updates state.
    getAuthor: typeof options.getAuthor === 'function' ? options.getAuthor : null,
    enabled: options.enabled !== false,
    classes: { ...DEFAULT_CLASSES, ...(options.classes || {}) },
    labels: { ...DEFAULT_LABELS, ...(options.labels || {}) },
    // Optional persistence hook: called with the full comment list on change.
    onCommentsChange: typeof options.onCommentsChange === 'function' ? options.onCommentsChange : null,
  };

  const state = {
    enabled: conf.enabled,
    activeInsertEl: null,
    author: options.author || 'Anonymous',
    comments: Array.isArray(options.comments) ? options.comments.map(normalizeComment) : [],
  };

  const getAuthor = () => (conf.getAuthor ? conf.getAuthor() : state.author);

  const doc = () => editor.getDoc();
  const body = () => editor.getBody();

  // Tells the toolbar toggle button (and any host) that on/off changed.
  const notifyState = () => {
    try {
      if (typeof editor.dispatch === 'function') editor.dispatch('TrackChangesStateChange');
      else editor.fire('TrackChangesStateChange'); // TinyMCE < 8 fallback
    } catch (err) {
    }
  };

  // ---- DOM helpers --------------------------------------------------------

  const isTextNode = (n) => !!n && n.nodeType === 3;
  const isElementNode = (n) => !!n && n.nodeType === 1;

  const getRange = () => {
    const sel = editor.selection.getSel();
    return sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
  };

  // `Range.extractContents`/`insertNode` leave zero-length text nodes behind
  // after a split. They hold no characters and must never be treated as a
  // valid caret target or neighbour, or the next Backspace falls through to
  // the browser's untracked native delete.
  const hasText = (n) => isTextNode(n) && n.data.length > 0;

  const firstText = (node) => {
    if (!node) return null;
    if (isTextNode(node)) return hasText(node) ? node : null;
    const walker = doc().createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) if (hasText(n)) return n;
    return null;
  };

  const lastText = (node) => {
    if (!node) return null;
    if (isTextNode(node)) return hasText(node) ? node : null;
    const walker = doc().createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let last = null;
    let n;
    while ((n = walker.nextNode())) if (hasText(n)) last = n;
    return last;
  };

  // The text node immediately before `ref` in document order (ref may be a
  // text node or an element), skipping `ref` itself and any empty text nodes.
  const textBefore = (ref) => {
    const walker = doc().createTreeWalker(body(), NodeFilter.SHOW_TEXT);
    let found = null;
    let n;
    while ((n = walker.nextNode())) {
      if (n === ref) return found;
      if (ref.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return found; // n is after ref -> the previous node was the last before it
      }
      if (hasText(n)) found = n; // n precedes ref -> keep looking (ignore empties)
    }
    return found;
  };

  const textAfter = (ref) => {
    const walker = doc().createTreeWalker(body(), NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (ref.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING) {
        if (hasText(n)) return n; // skip empty nodes, keep scanning
      }
    }
    return null;
  };

  // Descend a collapsed caret to a concrete text position where possible.
  const caretTextPos = (rng) => {
    const c = rng.startContainer;
    if (!c) return null;
    if (isTextNode(c)) return { node: c, offset: rng.startOffset };
    const kids = c.childNodes;
    const off = rng.startOffset;
    if (off < kids.length) {
      const t = firstText(kids[off]);
      if (t) return { node: t, offset: 0 };
    }
    if (off > 0) {
      const t = lastText(kids[off - 1]);
      if (t) return { node: t, offset: t.data.length };
    }
    return null;
  };

  const charRangeBefore = () => {
    const rng = getRange();
    if (!rng || !rng.collapsed) return null;
    const pos = caretTextPos(rng);
    if (!pos) return null;
    const r = doc().createRange();
    if (pos.offset > 0) {
      r.setStart(pos.node, pos.offset - 1);
      r.setEnd(pos.node, pos.offset);
      return r;
    }
    const prev = textBefore(pos.node);
    if (!prev || prev.data.length === 0 || !sameBlock(prev, pos.node)) return null;
    r.setStart(prev, prev.data.length - 1);
    r.setEnd(prev, prev.data.length);
    return r;
  };

  const charRangeAfter = () => {
    const rng = getRange();
    if (!rng || !rng.collapsed) return null;
    const pos = caretTextPos(rng);
    if (!pos) return null;
    const r = doc().createRange();
    if (pos.offset < pos.node.data.length) {
      r.setStart(pos.node, pos.offset);
      r.setEnd(pos.node, pos.offset + 1);
      return r;
    }
    const next = textAfter(pos.node);
    if (!next || next.data.length === 0 || !sameBlock(next, pos.node)) return null;
    r.setStart(next, 0);
    r.setEnd(next, 1);
    return r;
  };

  const setCaretBefore = (el) => {
    const r = doc().createRange();
    r.setStartBefore(el);
    r.collapse(true);
    editor.selection.setRng(r);
  };

  const setCaretAfter = (el) => {
    const r = doc().createRange();
    r.setStartAfter(el);
    r.collapse(true);
    editor.selection.setRng(r);
  };

  const setCaretToEnd = (el) => {
    const r = doc().createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    editor.selection.setRng(r);
  };

  const caretAtEnd = (el) => {
    const rng = getRange();
    if (!rng || !rng.collapsed) return false;
    const end = doc().createRange();
    end.selectNodeContents(el);
    end.collapse(false);
    return rng.startContainer === end.startContainer && rng.startOffset === end.startOffset;
  };

  const appendText = (el, text) => {
    const last = el.lastChild;
    if (last && isTextNode(last)) last.appendData(text);
    else el.appendChild(doc().createTextNode(text));
  };

  const classFor = (kind) => conf.classes[kind];

  // Block boundary guard: never extend a char-level edit across blocks, and let
  // the browser handle block merges (e.g. Backspace at the start of a paragraph).
  const blockOf = (node) => editor.dom.getParent(node, (elm) => editor.dom.isBlock(elm));
  const sameBlock = (a, b) => blockOf(a) === blockOf(b);

  // Nearest ancestor (within the body) carrying the marker class for `kind`.
  const markOf = (node, kind) =>
    editor.dom.getParent(
      node,
      (elm) => isElementNode(elm) && editor.dom.hasClass(elm, classFor(kind)),
      body()
    );

  const makeMark = (kind) => {
    const iso = new Date().toISOString();
    const author = String(getAuthor() || 'Anonymous');
    return editor.dom.create(kind === 'insert' ? 'ins' : 'del', {
      class: classFor(kind),
      datetime: iso,
      'data-author': author,
      'data-tooltip': conf.labels[kind] + ' ' + author + DASH + formatDateTime(iso),
    });
  };

  const isSameAuthorMark = (node, kind, ref) =>
    isElementNode(node) &&
    editor.dom.hasClass(node, classFor(kind)) &&
    node.getAttribute('data-author') === ref.getAttribute('data-author');

  // Skip the empty text nodes that `Range.extractContents`/`insertNode` leave
  // behind when splitting a text node, so adjacent markers are still seen.
  const adjacentElement = (el, dir) => {
    let n = dir > 0 ? el.nextSibling : el.previousSibling;
    while (n && isTextNode(n) && n.data.length === 0) {
      n = dir > 0 ? n.nextSibling : n.previousSibling;
    }
    return n;
  };

  // ---- comments -----------------------------------------------------------

  const commentTooltip = (rec) =>
    conf.labels.comment +
    ' ' +
    rec.author +
    DASH +
    formatDateTime(rec.datetime) +
    (rec.body ? '\n' + rec.body : '');

  const makeCommentMarker = (rec) =>
    editor.dom.create('span', {
      class: classFor('comment'),
      'data-comment-id': rec.id,
      'data-tooltip': commentTooltip(rec),
    });

  const commentSpan = (id) => {
    const sel = 'span.' + classFor('comment');
    return Array.from(body().querySelectorAll(sel)).find(
      (span) => span.getAttribute('data-comment-id') === id
    ) || null;
  };

  // Re-apply tooltips on any comment mark from the store (e.g. loaded content).
  const syncCommentTooltips = () => {
    Array.from(body().querySelectorAll('span.' + classFor('comment'))).forEach((span) => {
      const rec = state.comments.find((c) => c.id === span.getAttribute('data-comment-id'));
      if (rec) span.setAttribute('data-tooltip', commentTooltip(rec));
    });
  };

  // Re-apply tooltips on inserted/deleted marks from their datetime/author, so
  // loaded content also renders hover text in the local-time format.
  const syncChangeTooltips = () => {
    [['insert', 'ins'], ['delete', 'del']].forEach(([kind, tag]) => {
      Array.from(body().querySelectorAll(tag + '.' + classFor(kind))).forEach((el) => {
        const iso = el.getAttribute('datetime');
        if (!iso) return;
        const author = el.getAttribute('data-author') || 'Anonymous';
        el.setAttribute('data-tooltip', conf.labels[kind] + ' ' + author + DASH + formatDateTime(iso));
      });
    });
  };

  const emitComments = () => {
    if (conf.onCommentsChange) conf.onCommentsChange(state.comments.map((c) => ({ ...c })));
  };

  // Merge two adjacent <del> markers (`a` precedes `b` in document order),
  // keeping the older datetime and preserving text order.
  const uniteDels = (a, b) => {
    const keep = (a.getAttribute('datetime') || '') <= (b.getAttribute('datetime') || '') ? a : b;
    const drop = keep === a ? b : a;
    if (keep === a) {
      // a stays first; b's children follow a's.
      while (drop.firstChild) keep.appendChild(drop.firstChild);
    } else {
      // b stays; a's children must be prepended so order is a-then-b.
      const ref = keep.firstChild;
      while (drop.firstChild) keep.insertBefore(drop.firstChild, ref);
    }
    drop.parentNode.removeChild(drop);
    return keep;
  };

  const uniteAdjacentDels = (el) => {
    let out = el;
    const prev = adjacentElement(out, -1);
    const next = adjacentElement(out, 1);
    if (isSameAuthorMark(prev, 'delete', out)) {
      out = uniteDels(prev, out);
    } else if (isSameAuthorMark(next, 'delete', out)) {
      out = uniteDels(out, next);
    }
    return out;
  };

  const unwrap = (el) => {
    const parent = el.parentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  };

  const recordChange = () => {
    try {
      editor.undoManager.add();
    } catch (err) {
    }
    editor.setDirty(true);
    editor.nodeChanged();
  };

  // ---- mutations ----------------------------------------------------------

  const insertText = (text) => {
    const rng = getRange();
    if (!rng || !rng.collapsed) return false;

    const run = state.activeInsertEl;
    if (run && body().contains(run) && caretAtEnd(run)) {
      appendText(run, text);
      setCaretToEnd(run);
      return true;
    }

    const el = makeMark('insert');
    el.textContent = text;
    rng.insertNode(el);
    state.activeInsertEl = el;
    setCaretToEnd(el);
    return true;
  };

  const cancelInInsert = (ins, range) => {
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    range.deleteContents();
    if (ins.textContent.length === 0) {
      const parent = ins.parentNode;
      const next = ins.nextSibling;
      parent.removeChild(ins);
      if (next) setCaretBefore(next);
      else setCaretToEnd(parent);
    } else if (body().contains(startContainer)) {
      const r = doc().createRange();
      const offset = isTextNode(startContainer)
        ? Math.min(startOffset, startContainer.data.length)
        : startOffset;
      r.setStart(startContainer, offset);
      r.collapse(true);
      editor.selection.setRng(r);
    }
  };

  const pruneEmptyText = (n) => {
    if (isTextNode(n) && n.data.length === 0 && n.parentNode) n.parentNode.removeChild(n);
  };

  const wrapRangeInDel = (range) => {
    const el = makeMark('delete');
    el.appendChild(range.extractContents());
    range.insertNode(el);
    // Drop zero-length text nodes the split may have left on either side.
    pruneEmptyText(el.previousSibling);
    pruneEmptyText(el.nextSibling);
    return el;
  };

  const deleteAtCaret = (forward) => {
    for (let guard = 0; guard < 8; guard++) {
      const target = forward ? charRangeAfter() : charRangeBefore();
      if (!target) return false;

      const ins = markOf(target.startContainer, 'insert');
      if (ins) {
        cancelInInsert(ins, target);
        return true;
      }

      const del = markOf(target.startContainer, 'delete');
      if (del) {
        // Step over an existing deletion, then continue outwards so the new
        // characters merge into the same marker.
        if (forward) setCaretAfter(del);
        else setCaretBefore(del);
        continue;
      }

      const created = uniteAdjacentDels(wrapRangeInDel(target));
      if (forward) setCaretAfter(created);
      else setCaretBefore(created);
      return true;
    }
    return false;
  };

  const markRangeDeleted = (range) => {
    const ins = markOf(range.startContainer, 'insert');
    if (ins && ins.contains(range.startContainer) && ins.contains(range.endContainer)) {
      // Whole selection is our own insertion -> cancel it.
      if (ins.textContent === range.toString()) ins.parentNode.removeChild(ins);
      else range.deleteContents();
      return true;
    }
    const el = uniteAdjacentDels(wrapRangeInDel(range));
    setCaretAfter(el);
    return true;
  };

  const deleteSelection = (forward) => {
    state.activeInsertEl = null;
    const rng = getRange();
    if (!rng) return false;
    if (!rng.collapsed) return markRangeDeleted(rng);
    return deleteAtCaret(forward);
  };

  const acceptAll = () => {
    state.activeInsertEl = null;
    Array.from(body().querySelectorAll('ins.' + classFor('insert'))).forEach(unwrap);
    Array.from(body().querySelectorAll('del.' + classFor('delete'))).forEach((el) =>
      el.parentNode.removeChild(el)
    );
    recordChange();
  };

  const rejectAll = () => {
    state.activeInsertEl = null;
    Array.from(body().querySelectorAll('del.' + classFor('delete'))).forEach(unwrap);
    Array.from(body().querySelectorAll('ins.' + classFor('insert'))).forEach((el) =>
      el.parentNode.removeChild(el)
    );
    recordChange();
  };

  // ---- accept/reject the change at the caret ------------------------------

  // Nearest insert/delete marker around the caret or selection start.
  const changeElAt = () => {
    const rng = getRange();
    if (!rng) return null;
    let node = rng.startContainer;
    if (isTextNode(node)) node = node.parentNode;
    while (node && node !== body()) {
      if (
        isElementNode(node) &&
        (editor.dom.hasClass(node, classFor('insert')) ||
          editor.dom.hasClass(node, classFor('delete')))
      ) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

  const acceptChange = () => {
    const el = changeElAt();
    if (!el) return false;
    state.activeInsertEl = null;
    if (editor.dom.hasClass(el, classFor('insert'))) unwrap(el); // keep the inserted text
    else el.parentNode.removeChild(el); // apply the deletion
    recordChange();
    return true;
  };

  const rejectChange = () => {
    const el = changeElAt();
    if (!el) return false;
    state.activeInsertEl = null;
    if (editor.dom.hasClass(el, classFor('insert'))) el.parentNode.removeChild(el); // drop it
    else unwrap(el); // restore the deleted text
    recordChange();
    return true;
  };

  // ---- comments (mutations) ----------------------------------------------

  const addComment = (text) => {
    const rng = getRange();
    if (!rng || rng.collapsed) return null;
    const rec = normalizeComment({
      id: newCommentId(),
      author: getAuthor(),
      datetime: new Date().toISOString(),
      body: text,
    });
    const span = makeCommentMarker(rec);
    span.appendChild(rng.extractContents());
    rng.insertNode(span);
    setCaretAfter(span);
    state.comments.push(rec);
    emitComments();
    recordChange();
    return { ...rec };
  };

  const removeComment = (id) => {
    const span = commentSpan(id);
    if (span) unwrap(span);
    const before = state.comments.length;
    state.comments = state.comments.filter((c) => c.id !== id);
    if (span || state.comments.length !== before) {
      emitComments();
      recordChange();
    }
    return !!span;
  };

  const getComments = () => state.comments.map((c) => ({ ...c }));

  const setComments = (list) => {
    state.comments = Array.isArray(list) ? list.map(normalizeComment) : [];
    syncCommentTooltips();
    emitComments();
  };

  // ---- events -------------------------------------------------------------

  const onBeforeInput = (e) => {
    if (!state.enabled) return;
    if (e.isComposing) return; // let IME run natively
    const type = e.inputType || '';

    if (type === 'insertText' && typeof e.data === 'string' && e.data.length > 0) {
      if (insertText(e.data)) {
        e.preventDefault();
        recordChange();
      }
    } else if (type === 'insertParagraph' || type === 'insertLineBreak') {
      state.activeInsertEl = null; // structural break: start a fresh run
    } else if (type === 'deleteContentBackward' || type === 'deleteContentForward') {
      if (deleteSelection(type === 'deleteContentForward')) {
        e.preventDefault();
        recordChange();
      }
    }
  };

  const onNodeChange = () => {
    if (state.activeInsertEl && !caretAtEnd(state.activeInsertEl)) {
      state.activeInsertEl = null;
    }
  };

  // Cut: keep the text in place as a deletion instead of removing it, and
  // write the same text to the clipboard so Ctrl+X still "works".
  let cutDoc = null;
  const onCut = (e) => {
    if (!state.enabled) return;
    const rng = editor.selection.getRng();
    if (!rng || rng.collapsed) return;
    e.preventDefault();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    try {
      const text = editor.selection.getContent({ format: 'text' });
      if (e.clipboardData) e.clipboardData.setData('text/plain', text);
    } catch (err) {
    }
    state.activeInsertEl = null;
    markRangeDeleted(editor.selection.getRng());
    recordChange();
  };

  // Paste is intentionally left native (not tracked). TinyMCE's paste
  // pipeline does not surface through `beforeinput`.
  editor.on('beforeinput', onBeforeInput);
  editor.on('NodeChange', onNodeChange);

  // ---- hover tooltips -----------------------------------------------------
  // The tooltip is a real element in the host page, not a CSS `::after` on the
  // marker. That is deliberate: a CSS tooltip needs `position: relative` on the
  // marker, and Chrome paints a positioned inline box's background over the
  // text caret, which hid the caret inside commented text. Keeping the markers
  // unpositioned lets the caret render above their (opaque) highlight.
  const TIP_STYLE_ID = 'tc-tooltip-style';
  const TIP_CSS =
    '.tc-tooltip{position:fixed;z-index:2147483647;box-sizing:border-box;' +
    'max-width:280px;padding:3px 6px;background:#fff;color:#0f172a;' +
    'border:1px solid #474747;border-radius:4px;font:12px/1.4 sans-serif;' +
    'white-space:pre-line;overflow-wrap:break-word;pointer-events:none;display:none}';

  let tipEl = null;
  let tipDoc = null;

  const ensureTip = () => {
    if (tipEl && tipEl.isConnected) return tipEl;
    const container = editor.getContainer && editor.getContainer();
    tipDoc = (container && container.ownerDocument) || doc();
    if (!tipDoc.getElementById(TIP_STYLE_ID)) {
      const style = tipDoc.createElement('style');
      style.id = TIP_STYLE_ID;
      style.textContent = TIP_CSS;
      (tipDoc.head || tipDoc.documentElement).appendChild(style);
    }
    tipEl = tipDoc.createElement('div');
    tipEl.className = 'tc-tooltip';
    (tipDoc.body || tipDoc.documentElement).appendChild(tipEl);
    return tipEl;
  };

  const hideTip = () => {
    if (tipEl) tipEl.style.display = 'none';
  };

  const markerSelector = () =>
    'ins.' + classFor('insert') + ',del.' + classFor('delete') + ',span.' + classFor('comment');

  // Tooltip text is derived from the marker at hover time instead of being read
  // from the stored `data-tooltip`. Hosts (e.g. the React wrapper) can inject
  // initial content *after* `init`, so a one-off sync leaves stale strings in
  // place. Deriving keeps labels/timestamps fresh and always in local time.
  const tooltipFor = (marker) => {
    const id = marker.getAttribute('data-comment-id');
    if (id) {
      const rec = state.comments.find((c) => c.id === id);
      if (rec) return commentTooltip(rec);
    }
    const kind = editor.dom.hasClass(marker, classFor('insert'))
      ? 'insert'
      : editor.dom.hasClass(marker, classFor('delete'))
        ? 'delete'
        : null;
    if (kind) {
      const iso = marker.getAttribute('datetime');
      if (iso) {
        const author = marker.getAttribute('data-author') || 'Anonymous';
        return conf.labels[kind] + ' ' + author + DASH + formatDateTime(iso);
      }
    }
    return marker.getAttribute('data-tooltip');
  };

  const showTip = (marker) => {
    const text = tooltipFor(marker);
    if (!text) {
      hideTip();
      return;
    }
    const tip = ensureTip();
    if (!tip) return;
    tip.textContent = text;
    tip.style.display = 'block';

    // The marker lives inside the content iframe, so convert its viewport rect
    // to host-page coordinates before placing the fixed-position tooltip.
    const frameWin = editor.getWin && editor.getWin();
    const frame = (frameWin && frameWin.frameElement) || editor.iframeElement || null;
    const rect = marker.getBoundingClientRect();
    const offset = frame && frame.getBoundingClientRect ? frame.getBoundingClientRect() : { left: 0, top: 0 };
    const view = tipDoc.defaultView || window;
    const left = offset.left + rect.left;
    const top = offset.top + rect.top;
    tip.style.left = Math.max(4, Math.min(left, view.innerWidth - tip.offsetWidth - 4)) + 'px';
    tip.style.top = Math.max(4, top - tip.offsetHeight - 6) + 'px';
  };

  const onTipMove = (e) => {
    const marker = editor.dom.getParent(e.target, markerSelector(), body());
    if (marker) showTip(marker);
    else hideTip();
  };

  let tipBoundDoc = null;
  const bindTips = () => {
    tipBoundDoc = editor.getDoc();
    if (tipBoundDoc && tipBoundDoc.body) {
      tipBoundDoc.body.addEventListener('mouseover', onTipMove);
      tipBoundDoc.body.addEventListener('mouseleave', hideTip);
    }
    const win = editor.getWin && editor.getWin();
    if (win) win.addEventListener('scroll', hideTip, true);
  };
  const unbindTips = () => {
    if (tipBoundDoc && tipBoundDoc.body) {
      tipBoundDoc.body.removeEventListener('mouseover', onTipMove);
      tipBoundDoc.body.removeEventListener('mouseleave', hideTip);
    }
    tipBoundDoc = null;
    const win = editor.getWin && editor.getWin();
    if (win) win.removeEventListener('scroll', hideTip, true);
    if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl);
    tipEl = null;
  };

  // ---- UI + init ----------------------------------------------------------

  const svgWrap = (inner) =>
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ' +
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round">' +
    inner +
    '</svg>';

  // Distinct metaphors so the buttons don't read alike:
  //   track   -> a pen (editing), with a slash when tracking is off
  //   accept  -> a tick        accept-all -> a double tick
  //   reject  -> a cross       reject-all -> a double cross
  const TOOL_ICONS = {
    'tc-track':
      '<path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>' +
      '<path d="M15 5l4 4"/>',
    'tc-track-off':
      '<path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>' +
      '<path d="M15 5l4 4"/>' +
      '<path d="M3 3l18 18"/>',
    'tc-accept': '<path d="M5 13l4 4L19 7"/>',
    'tc-reject': '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    'tc-accept-all': '<path d="M2 13l3 3 6-6"/><path d="M12 13l3 3 6-6"/>',
    'tc-reject-all':
      '<path d="M3 9l7 7"/><path d="M10 9l-7 7"/><path d="M14 9l7 7"/><path d="M21 9l-7 7"/>',
  };

  const registerToolbar = () => {
    const ui = editor.ui;
    if (!ui || !ui.registry || !ui.registry.addButton) return;

    Object.keys(TOOL_ICONS).forEach((name) => ui.registry.addIcon(name, svgWrap(TOOL_ICONS[name])));

    ui.registry.addToggleButton('tctrack', {
      icon: 'tc-track',
      tooltip: 'Show/hide track changes',
      onAction: () => api.toggle(),
      onSetup: (btnApi) => {
        const sync = () => {
          btnApi.setActive(state.enabled);
          if (typeof btnApi.setIcon === 'function') {
            btnApi.setIcon(state.enabled ? 'tc-track' : 'tc-track-off');
          }
        };
        sync();
        editor.on('TrackChangesStateChange', sync);
        return () => editor.off('TrackChangesStateChange', sync);
      },
    });

    ui.registry.addButton('tcaccept', {
      icon: 'tc-accept',
      tooltip: 'Accept current change',
      onAction: () => api.acceptChange(),
    });
    ui.registry.addButton('tcreject', {
      icon: 'tc-reject',
      tooltip: 'Reject current change',
      onAction: () => api.rejectChange(),
    });
    ui.registry.addButton('tcacceptall', {
      icon: 'tc-accept-all',
      tooltip: 'Accept all changes',
      onAction: () => api.acceptAll(),
    });
    ui.registry.addButton('tcrejectall', {
      icon: 'tc-reject-all',
      tooltip: 'Reject all changes',
      onAction: () => api.rejectAll(),
    });

    ui.registry.addButton('tcaddcomment', {
      text: 'Comment',
      tooltip: 'Add a comment',
      onAction: () => {
        const bookmark = editor.selection.getBookmark(2, true);
        editor.windowManager.open({
          title: 'Add comment',
          size: 'normal',
          body: {
            type: 'panel',
            items: [
              {
                type: 'textarea',
                name: 'body',
                label: 'Comment',
                placeholder: 'Write a comment…',
              },
            ],
          },
          buttons: [
            { type: 'cancel', text: 'Cancel' },
            { type: 'submit', text: 'Add', primary: true },
          ],
          onSubmit: (dialogApi) => {
            const data = dialogApi.getData();
            dialogApi.close();
            editor.selection.moveToBookmark(bookmark);
            addComment(data.body);
          },
        });
      },
    });
  };

  registerToolbar();

  // The body does not exist yet during `setup`, so wait for `init`.
  editor.on('init', () => {
    // Capture phase so we run before the browser's default cut.
    cutDoc = editor.getDoc();
    cutDoc.addEventListener('cut', onCut, true);
    bindTips();
    // Tear the tooltip down even when the host relies on tinymce.remove()
    // rather than calling api.destroy(); otherwise the shared element leaks.
    editor.on('remove', unbindTips);
    syncCommentTooltips();
    syncChangeTooltips();
    emitComments();
  });

  // ---- public API ---------------------------------------------------------

  const api = {
    enable() {
      state.enabled = true;
      notifyState();
    },
    disable() {
      state.enabled = false;
      state.activeInsertEl = null;
      notifyState();
    },
    toggle() {
      if (state.enabled) api.disable();
      else api.enable();
      return state.enabled;
    },
    isEnabled() {
      return state.enabled;
    },
    setAuthor(name) {
      state.author = name || 'Anonymous';
    },
    insertText,
    deleteSelection,
    acceptChange,
    rejectChange,
    acceptAll,
    rejectAll,
    addComment,
    removeComment,
    getComments,
    setComments,
    destroy() {
      editor.off('beforeinput', onBeforeInput);
      editor.off('NodeChange', onNodeChange);
      if (cutDoc) cutDoc.removeEventListener('cut', onCut, true);
      unbindTips();
    },
  };

  // Convenience handle for hosts and debugging.
  editor.trackChanges = api;
  return api;
}

export { TRACK_CHANGES_VALID_ELEMENTS, formatDateTime, setupTrackChanges };
//# sourceMappingURL=trackchanges.esm.js.map
