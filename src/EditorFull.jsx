import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// Every free Community plugin bundled with the self-hosted package.
const ALL_PLUGINS = [
  'accordion', 'advlist', 'anchor', 'autolink', 'autosave',
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

// In-browser image upload so the Upload tab appears without a backend.
// const imagesUploadHandler = (blobInfo) =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = () => reject('Upload failed');
//     reader.readAsDataURL(blobInfo.blob());
//   });

export default function EditorFull() {
  const editorRef = useRef(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      onInit={(_evt, editor) => {
        editorRef.current = editor;
      }}
      initialValue={
        '<h2>Everything the free self-hosted editor can do</h2>' +
        '<p>Try the toolbar, the menu bar, and the image dialog (the <strong>Upload</strong> tab is now available).</p>'
      }
      init={{
        height: 500,
        menubar: 'file edit view insert format tools table help',
        plugins: ALL_PLUGINS,
        toolbar: FULL_TOOLBAR,
        toolbar_mode: 'sliding',   // reveal-and-hide button (extra row)
        // toolbar_mode: 'wrap',      // no button — every button always visible, rows wrap

        // Layout / behaviour
        resize: true,
        statusbar: true,
        elementpath: true,
        branding: false,
        promotion: false,
        placeholder: 'Write your blog post…',
        contextmenu: 'link image table',

        // Image uploads — this is what makes the Upload tab appear
        automatic_uploads: true,
        image_uploadtab: true,
        image_advtab: true,
        image_title: true,
        image_caption: true,
        images_file_types: 'jpeg,jpg,png,gif,webp,svg',
        images_reuse_filename: true,
        // images_upload_handler: imagesUploadHandler,

        // Links
        link_default_target: '_blank',
        link_assume_external_targets: true,
        link_context_toolbar: true,

        // Media
        media_live_embeds: true,

        // Paste
        paste_data_images: true,
        smart_paste: true,

        // Formatting
        block_formats:
          'Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4;Preformatted=pre;Blockquote=blockquote',
        font_family_formats:
          'System UI=system-ui,sans-serif;Georgia=Georgia,serif;Times=Times New Roman,serif;Courier=Courier New,monospace;Arial=Arial,sans-serif',
        font_size_formats: '12px 14px 16px 18px 24px 36px',
        line_height_formats: '1 1.2 1.5 2',
        style_formats: [
          { title: 'Lead paragraph', block: 'p', classes: 'lead' },
          { title: 'Callout', block: 'div', classes: 'callout' },
          { title: 'Inline code', inline: 'code' },
        ],
        color_map: [
          '#000000', 'Black', '#ffffff', 'White', '#ef4444', 'Red',
          '#2563eb', 'Blue', '#16a34a', 'Green', '#f59e0b', 'Amber',
        ],

        // Code samples
        codesample_languages: [
          { text: 'HTML/XML', value: 'markup' },
          { text: 'JavaScript', value: 'javascript' },
          { text: 'CSS', value: 'css' },
          { text: 'JSON', value: 'json' },
          { text: 'Python', value: 'python' },
        ],

        // Autosave
        autosave_interval: '30s',

        // Quickbars
        quickbars_selection_toolbar: 'bold italic | link h2 h3 blockquote',
        quickbars_insert_toolbar: 'quickimage quicktable',

        // Import CSS from the page stylesheet
        importcss_append: true,

        // Tables
        table_sizing_mode: 'responsive',
        table_toolbar:
          'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',

        // Misc
        indent: true,
        forced_root_block: 'p',
        newline_behavior: 'block',
        directionality: 'ltr',
        content_language: 'en',
        a11y_advanced_options: true,
        xss_sanitization: true,
        deprecation_warnings: true,
      }}
    />
  );
}
