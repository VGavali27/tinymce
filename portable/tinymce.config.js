// ---------------------------------------------------------------------------
// Portable TinyMCE 8 configuration (self-hosted, GPL licensed).
// Copy this file into another project as-is and pass BLOG_INIT to the editor.
// ---------------------------------------------------------------------------
// Requirements in the target project:
//   npm i tinymce @tinymce/tinymce-react      (runtime)
//   npm i -D fs-extra                         (only for the postinstall copy)
//
// The library is served as a static file from /tinymce/tinymce.min.js (see
// postinstall.js + README.md). No Tiny Cloud CDN, no apiKey, no editor-load
// metering. The component must also set licenseKey="gpl" (React) or
// license_key: 'gpl' (vanilla) — see README.md.
//
// This file mirrors src/AddBlog.jsx in the source repo. If you change one,
// change the other.
// ---------------------------------------------------------------------------

// Path the browser loads TinyMCE from. This is the copy that postinstall.js
// places in the project's public directory.
export const TINYMCE_SRC = '/tinymce/tinymce.min.js';

// In-browser image upload so the Upload tab appears without a backend.
//
// NOTE: this resolves with a base64 data URI, so the image is stored *inside*
// the post HTML. That bloats the database — in production, POST blobInfo.blob()
// to your server and resolve with the returned URL instead.
const imagesUploadHandler = (blobInfo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject('Upload failed');
    reader.readAsDataURL(blobInfo.blob());
  });

// Every plugin in the free self-hosted package — the same set the Full editor
// tab (src/EditorFull.jsx) in the source repo loads.
//
// `autoresize` is deliberately NOT loaded: it sizes the editor to its content
// and overrides `height` below. Add it back if you want the editor to grow with
// the post instead of scrolling.
//
// Premium / Tiny Cloud plugins (ai, comments, revisionhistory, powerpaste,
// casechange, formatpainter, linkchecker, mentions, …) are absent: they are not
// part of the free `tinymce` package. See src/data/premium.js in the source
// repo for the full list.
export const BLOG_PLUGINS = [
  'accordion', 'advlist', 'anchor', 'autolink', 'autosave',
  'charmap', 'code', 'codesample', 'directionality', 'emoticons', 'fullscreen',
  'help', 'image', 'importcss', 'insertdatetime', 'link', 'lists', 'media',
  'nonbreaking', 'pagebreak', 'preview', 'quickbars', 'save', 'searchreplace',
  'table', 'visualblocks', 'visualchars', 'wordcount',
];

// The blog toolbar — the same groups, in the same order, as src/AddBlog.jsx.
// Each array entry is one group; joined with '|' so TinyMCE renders a vertical
// divider between groups (the divider line itself is CSS — see
// tinymce.overrides.css).
//
// IMPORTANT: it must stay a SINGLE string. If you pass an array instead,
// TinyMCE renders one .tox-toolbar per entry (inside .tox-toolbar-overlord) and
// the row-divider CSS in tinymce.overrides.css no longer applies.
export const BLOG_TOOLBAR = [
  'undo redo',
  'bold italic underline strikethrough',
  'blocks fontfamily',
  'fontsize lineheight',
  'alignleft aligncenter alignright alignjustify',
  'bullist numlist',
  'forecolor backcolor removeformat',
  'outdent indent',
  'ltr rtl',
  'link unlink anchor',
  'image media table',
  'charmap emoticons pagebreak hr',
  'accordion codesample',
  'searchreplace visualblocks visualchars code',
  'save fullscreen preview',
].join('|');

export const BLOG_INIT = {
  // Sizing
  height: 500,
  resize: true,

  // Bar / toolbar
  menubar: 'file edit view insert format tools table help',
  plugins: BLOG_PLUGINS,
  toolbar: BLOG_TOOLBAR,
  // 'wrap' keeps every button visible and wraps onto extra rows
  // (instead of 'sliding', which hides extras behind a "…" button).
  toolbar_mode: 'wrap',
  contextmenu: 'link image table',

  // Responsive / phone + tablet overrides. On a touch device the core replaces
  // `toolbar_mode` with its own 'scrolling' and (on phones) turns `menubar` off
  // entirely, so this section — applied *after* the top-level options — is the
  // only place that can override them. 'sliding' keeps the toolbar to a single
  // row and tucks the extra buttons behind a "…" button, so the bar never needs
  // a horizontal scrollbar on a narrow screen.
  mobile: {
    menubar: 'file edit view insert format tools table help',
    toolbar_mode: 'sliding',
  },

  // Status bar
  statusbar: true,
  elementpath: true,
  // Hide the "💝 Get all features" upgrade promotion (promotion defaults to true).
  promotion: false,
  // Hide the "Build with TinyMCE" status-bar branding (branding defaults to true).
  branding: false,
  placeholder: 'Write your blog post…',

  // Image uploads — this is what makes the Upload tab appear
  automatic_uploads: true,
  image_uploadtab: true,
  image_advtab: true,
  image_title: true,
  image_caption: true,
  images_file_types: 'jpeg,jpg,png,gif,webp,svg',
  images_reuse_filename: true,
  images_upload_handler: imagesUploadHandler,

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

  // Autosave (draft kept in the browser)
  autosave_interval: '30s',

  // Quickbars
  quickbars_selection_toolbar: 'bold italic | link h2 h3 blockquote',
  quickbars_insert_toolbar: 'quickimage quicktable',

  // Pull classes from the page stylesheet into the Formats menu
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

  // Blog-specific extras (not part of the Full editor tab)
  // p[*] keeps attributes such as class on paragraphs - which the style_formats
  // above need ('Lead paragraph' adds class="lead").
  extended_valid_elements: 'p[*],span[*],delete[*],insert[*]',
  noneditable_class: 'mceNonEditable',
  // Store absolute URLs so the saved HTML works on any host.
  relative_urls: false,
  remove_script_host: false,
};
