import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// Default TinyMCE, no custom styling or content_style.
export default function EditorDemo() {
  const editorRef = useRef(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      onInit={(_evt, editor) => {
        editorRef.current = editor;
      }}
      initialValue="<p>Write your <strong>blog post</strong> here…</p>"
      init={{ height: 500, promotion: false, branding: false }}
    />
  );
}
