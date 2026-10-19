import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { createEditorConfig } from './editor/editorConfig.js';

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

const INITIAL_CONTENT = '<p>Write your <strong>blog post</strong> here…</p>';

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Playground — the Add blog fields plus an editor built from the shared config.
// The "Track changes" checkbox only flips `trackChanges`; everything else
// (plugins, toolbar, options) comes from src/editor/.
export default function Playground() {
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
        .map((t) => t.trim())
        .filter(Boolean),
      content: editorRef.current ? editorRef.current.getContent() : '',
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

        <h4>Without track changes</h4>
        <Editor
          {...createEditorConfig({
            overrides: { height: 420 },
          })}
          onInit={(_evt, editor) => {
            editorRef.current = editor;
          }}
          initialValue={INITIAL_CONTENT}
        />

        <h4>With track changes</h4>
        <Editor
          {...createEditorConfig({
            trackChanges: true,
            author: fields.author || 'Author',
            overrides: { height: 420 },
          })}
          onInit={(_evt, editor) => {
            editorRef.current = editor;
          }}
          initialValue={INITIAL_CONTENT}
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
