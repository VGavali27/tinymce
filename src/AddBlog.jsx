import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const EMPTY = {
  title: '',
  slug: '',
  category: 'General',
  tags: '',
  author: '',
  status: 'Draft',
  excerpt: '',
};

const CATEGORIES = ['General', 'Technology', 'Travel', 'Food', 'Lifestyle'];
const STATUSES = ['Draft', 'Review', 'Published'];

// In-browser image upload so the Upload tab appears without a backend.
const imagesUploadHandler = (blobInfo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject('Upload failed');
    reader.readAsDataURL(blobInfo.blob());
  });

// Every plugin in the free self-hosted package - the same set the Full editor
// tab (src/EditorFull.jsx) loads.
//
// `autoresize` is deliberately NOT loaded here: it sizes the editor to its
// content and overrides `height` below. Add it back if you want the editor to
// grow with the post instead of scrolling.
//
// Dropped - not part of the free package / removed in v6+:
//   plugins: print, paste, template, toc, imagetools, textpattern, noneditable
//   (hr is a core toolbar button, not a plugin)
//   toolbar buttons: print, insertfile, template, addComment
// Renamed:
//   fontselect -> fontfamily, fontsizeselect -> fontsize, formatselect -> blocks
//   default_link_target -> link_default_target
//   noneditable_noneditable_class -> noneditable_class
//   toolbar1 -> toolbar
const BLOG_PLUGINS = [
  'accordion', 'advlist', 'anchor', 'autolink', 'autosave',
  'charmap', 'code', 'codesample', 'directionality', 'emoticons', 'fullscreen',
  'help', 'image', 'importcss', 'insertdatetime', 'link', 'lists', 'media',
  'nonbreaking', 'pagebreak', 'preview', 'quickbars', 'save', 'searchreplace',
  'table', 'visualblocks', 'visualchars', 'wordcount',
];

// Every button the loaded plugins provide - the same groups as the Full editor.
// Each array entry is one group; joined with ' | ' so TinyMCE renders a vertical
// divider between groups (the divider line itself is CSS - see src/App.css).
const BLOG_TOOLBAR = [
  'undo redo',
  'bold italic underline strikethrough',
  'blocks fontfamily ',
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
  'searchreplace visualblocks visualchars code ',
  'save fullscreen preview',

].join('|');

const BLOG_INIT = {
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

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Blog authoring page: post fields next to the default TinyMCE editor.
export default function AddBlog() {
  const editorRef = useRef(null);
  const [fields, setFields] = useState(EMPTY);
  const [saved, setSaved] = useState(null);

  const update = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    const post = {
      ...fields,
      slug: fields.slug || slugify(fields.title),
      tags: fields.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      content: editorRef.current ? editorRef.current.getContent() : '',
      savedAt: new Date().toISOString(),
    };
    setSaved(post);
  };

  const handleReset = () => {
    setFields(EMPTY);
    setSaved(null);
    if (editorRef.current) editorRef.current.setContent('');
  };

  return (
    <form className="blog-form" onSubmit={handleSave}>
      <div className="blog-fields">
        <h3>Post details</h3>

        <label className="field wide">
          <span>Title</span>
          <input
            value={fields.title}
            onChange={update('title')}
            placeholder="My blog post"
            required
          />
        </label>

        <label className="field">
          <span>Slug</span>
          <input
            value={fields.slug}
            onChange={update('slug')}
            placeholder="auto-generated from title"
          />
        </label>

        <label className="field">
          <span>Category</span>
          <select value={fields.category} onChange={update('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Tags</span>
          <input
            value={fields.tags}
            onChange={update('tags')}
            placeholder="react, tinymce, blogging"
          />
        </label>

        <label className="field">
          <span>Author</span>
          <input
            value={fields.author}
            onChange={update('author')}
            placeholder="Your name"
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select value={fields.status} onChange={update('status')}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="field wide">
          <span>Excerpt</span>
          <textarea
            value={fields.excerpt}
            onChange={update('excerpt')}
            placeholder="Short summary shown in listings"
          />
        </label>
      </div>

      <div>
        <h3>Content</h3>
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          licenseKey="gpl"
          onInit={(_evt, editor) => {
            editorRef.current = editor;
          }}
          initialValue="<p>Write your <strong>blog post</strong> here…</p>"
          init={BLOG_INIT}
        />
      </div>

      <div className="blog-actions">
        <button type="submit" className="btn primary">
          Save post
        </button>
        <button type="button" className="btn" onClick={handleReset}>
          Reset
        </button>
        {saved && <span className="saved-note">Saved locally (see console).</span>}
      </div>

      {saved && <pre className="saved">{JSON.stringify(saved, null, 2)}</pre>}
    </form>
  );
}
