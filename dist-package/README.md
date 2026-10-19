# TinyMCE Track Changes Bundle

This is a reusable bundle of the track changes editor config and core.

## Files included
- trackchanges.esm.js / trackchanges.cjs.js - Core track changes logic
- editorConfig.esm.js / editorConfig.cjs.js - Shared editor configuration
- trackChangesOptions.esm.js / trackChangesOptions.cjs.js - Track changes options
- tinymce-trackchanges.esm.js - Combined bundle

## Usage in another project

`jsx
import { Editor } from '@tinymce/tinymce-react';
import { createEditorConfig } from '@your-scope/tinymce-trackchanges/editor-config';

<Editor {...createEditorConfig({ trackChanges: true, author: 'John' })} />
`

## Prerequisites in consuming project
- Self-hosted TinyMCE at /tinymce/ (copy node_modules/tinymce to public/tinymce)
- @tinymce/tinymce-react installed
