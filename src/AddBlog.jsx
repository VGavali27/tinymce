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

// Classic (TinyMCE 5-era) config adapted to the self-hosted TinyMCE 8 package.
// Dropped - not part of the free package / removed in v6+:
//   plugins: print, paste, template, toc, imagetools, textpattern, noneditable
//   (hr is a core toolbar button, not a plugin)
//   toolbar buttons: print, insertfile, template, addComment
// Renamed:
//   fontselect -> fontfamily, fontsizeselect -> fontsize, formatselect -> blocks
//   default_link_target -> link_default_target
//   noneditable_noneditable_class -> noneditable_class
//   toolbar1 -> toolbar
const BLOG_PLUGINS =
  'searchreplace preview importcss autolink autosave save directionality code ' +
  'visualblocks visualchars fullscreen image link media codesample table ' +
  'charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount ' +
  'help quickbars emoticons';

// Each array entry is one group of functions; joined with ' | ' so TinyMCE
// renders a vertical divider between every group.
const BLOG_TOOLBAR = [
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

const BLOG_INIT = {
  height: 500,
  // Hide the "💝 Get all features" upgrade promotion (promotion defaults to true).
  promotion: false,
  // Hide the "Build with TinyMCE" status-bar branding (branding defaults to true).
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
