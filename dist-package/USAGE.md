# TinyMCE Track Changes Bundle

Ready-to-use bundle for TinyMCE track changes. Works with self-hosted TinyMCE + @tinymce/tinymce-react (Vite/ESM or CJS).

## What's included
- 	rackchanges.esm.js / 	rackchanges.cjs.js - Core (setupTrackChanges, API, tooltip)
- editorConfig.esm.js / editorConfig.cjs.js - Shared config (createEditorConfig, createEditorInit, PLUGINS, TOOLBAR_GROUPS)
- 	rackChangesOptions.esm.js / 	rackChangesOptions.cjs.js - Track-changes merge (CSS inlined as string)
- 	inymce-trackchanges.esm.js - Combined ESM bundle
- Source maps included

## Installation in another project
1. Extract 	inymce-trackchanges-bundle.zip to 
ode_modules/@your-scope/tinymce-trackchanges/ (or publish to npm)
2. Ensure TinyMCE is self-hosted at /tinymce/tinymce.min.js (copy 
ode_modules/tinymce to public/tinymce). Add a postinstall script like your current project uses.

Dependencies needed in consuming project:
- @tinymce/tinymce-react
- 	inymce (self-hosted)
- React 18+

## Usage

ESM:
`jsx
import { Editor } from '@tinymce/tinymce-react';
import { createEditorConfig } from '@your-scope/tinymce-trackchanges/editor-config';

export default function Example() {
  return (
    <>
      <h4>Without track changes</h4>
      <Editor {...createEditorConfig({ overrides: { height: 420 } })} />
      
      <h4>With track changes</h4>
      <Editor {...createEditorConfig({ trackChanges: true, author: 'Author' })} />
    </>
  );
}
`

Also available:
- @your-scope/tinymce-trackchanges → core
- @your-scope/tinymce-trackchanges/track-changes-options → options module
- @your-scope/tinymce-trackchanges/all → combined

The track changes CSS is inlined via content_style (Vite/raw-string bundled). No separate CSS file to serve.
