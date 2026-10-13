// Minimal, copy-ready React component showing the full self-hosted TinyMCE 8
// wiring: static script path, GPL license key, and the shared init config.
//
// No wrapper class is required — the rules in tinymce.overrides.css are global.
// Wrap the editor in a div only if you want to constrain its width in your own
// layout.
import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { BLOG_INIT, TINYMCE_SRC } from './tinymce.config.js';
import './tinymce.overrides.css';

export default function BlogEditor() {
  const editorRef = useRef(null);

  return (
    <Editor
      // Load TinyMCE from the copy postinstall.js made in /public.
      // No Tiny Cloud CDN and no apiKey.
      tinymceScriptSrc={TINYMCE_SRC}
      // Self-hosted use under GPLv2+ is free; this silences the license prompt.
      licenseKey="gpl"
      init={BLOG_INIT}
      initialValue="<p>Write your blog post here…</p>"
      onInit={(_evt, editor) => {
        editorRef.current = editor;
      }}
    />
  );
}
