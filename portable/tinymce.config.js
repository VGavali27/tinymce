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
// ---------------------------------------------------------------------------

// Path the browser loads TinyMCE from. This is the copy that postinstall.js
// places in the project's public directory.
export const TINYMCE_SRC = '/tinymce/tinymce.min.js';

// Only free plugins that ship in the `tinymce` npm package. Anything from the
// premium (Tiny Cloud) set is intentionally absent.
export const BLOG_PLUGINS =
  'searchreplace preview importcss autolink autosave save directionality code ' +
  'visualblocks visualchars fullscreen image link media codesample table ' +
  'charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount ' +
  'help quickbars emoticons';

// Each array entry is one group of functions; joined with ' | ' so TinyMCE
// renders a vertical divider between every group.
//
// IMPORTANT: it must stay a SINGLE string. If you pass an array instead,
// TinyMCE renders one .tox-toolbar per entry (inside .tox-toolbar-overlord) and
// the row-divider CSS in tinymce.overrides.css no longer applies.
export const BLOG_TOOLBAR = [
  'undo redo',
  'bold italic underline strikethrough',
  'fontfamily fontsize blocks',
  'alignleft aligncenter alignright alignjustify',
  'outdent indent',
  'numlist bullist',
  'forecolor backcolor removeformat',
  'pagebreak',
  'charmap emoticons',
  'fullscreen preview save',
  'image media link anchor codesample',
  'ltr rtl',
].join(' | ');

export const BLOG_INIT = {
  height: 500,
  // Hide the "💝 Get all features" upgrade promotion (defaults to true).
  promotion: false,
  // Hide the "Build with TinyMCE" status-bar branding (defaults to true).
  branding: false,
  plugins: BLOG_PLUGINS,
  toolbar: BLOG_TOOLBAR,
  // 'wrap' keeps every button visible and wraps onto extra rows
  // (instead of 'sliding', which hides extras behind a "…" button).
  toolbar_mode: 'wrap',
  contextmenu: 'link image table',
  quickbars_selection_toolbar:
    'bold italic | h2 h3 blockquote quickimage quicktable',
  extended_valid_elements: 'p,span[*],delete[*],insert[*]',
  noneditable_class: 'mceNonEditable',
  link_default_target: '_blank',
  image_caption: true,
  relative_urls: false,
  remove_script_host: false,
};
