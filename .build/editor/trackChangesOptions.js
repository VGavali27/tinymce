// Track-changes specific editor options.
//
// Kept out of the generic config in `editorConfig.js` so a page can opt in by
// flipping a single flag. This file only *imports* the React-free core that
// lives in `src/trackchanges/`; it adds nothing to that folder.
import {
  setupTrackChanges,
  TRACK_CHANGES_VALID_ELEMENTS,
} from '../trackchanges/trackchanges.js';
import trackChangesCss from '../trackchanges/trackchanges.css';

// The attribute allow-list the core expects (ins/del/span/time). Re-exported so
// pages don't have to reach into src/trackchanges/ directly.
export { TRACK_CHANGES_VALID_ELEMENTS };

// Toolbar group holding every track-changes button — its own trailing group.
export const TRACK_CHANGES_TOOLBAR_GROUP =
  'tctrack tcaccept tcreject tcacceptall tcrejectall tcaddcomment';

// Extra button added to the selection quickbar when track changes is on.
export const TRACK_CHANGES_QUICKBAR_ITEM = 'tcaddcomment';

// Marker styles injected into the editor iframe via `content_style`.
export const TRACK_CHANGES_CONTENT_STYLE = trackChangesCss;

// Build the `setup` callback for a track-changes editor: boot the core, mirror
// toolbar state changes back to the host, then hand the API to the host.
export const createTrackChangesSetup =
  ({ author, enabled = true, onStateChange, onSetup, setup } = {}) =>
  (editor) => {
    const api = setupTrackChanges(editor, { author, enabled });

    // Keep a host toggle (e.g. a React label) in step with the toolbar button.
    editor.on('TrackChangesStateChange', () =>
      onStateChange?.(editor.trackChanges.isEnabled())
    );

    onSetup?.(api, editor);
    setup?.(editor, api);
  };

// Merge every track-changes option into an init object built by editorConfig.
// Returns a new object; `init` is never mutated.
export const applyTrackChangesOptions = (init, options = {}) => ({
  ...init,
  toolbar: [init.toolbar, TRACK_CHANGES_TOOLBAR_GROUP]
    .filter(Boolean)
    .join(' | '),
  content_style: [init.content_style, TRACK_CHANGES_CONTENT_STYLE]
    .filter(Boolean)
    .join('\n'),
  // p[*] keeps style_formats classes such as "lead".
  extended_valid_elements: 'p[*],' + TRACK_CHANGES_VALID_ELEMENTS,
  quickbars_selection_toolbar: [
    init.quickbars_selection_toolbar,
    TRACK_CHANGES_QUICKBAR_ITEM,
  ]
    .filter(Boolean)
    .join(' | '),
  setup: createTrackChangesSetup(options),
});
