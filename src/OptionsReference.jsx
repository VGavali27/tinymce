import { useMemo, useState } from 'react';
import { CATEGORY_ORDER, EDITOR_OPTIONS } from './data/editorOptions.js';

export default function OptionsReference() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return EDITOR_OPTIONS.filter(
      (o) =>
        (cat === 'all' || o.cat === cat) &&
        (!needle ||
          o.name.toLowerCase().includes(needle) ||
          o.desc.toLowerCase().includes(needle))
    );
  }, [q, cat]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const o of filtered) {
      if (!map.has(o.cat)) map.set(o.cat, []);
      map.get(o.cat).push(o);
    }
    return [...map.entries()].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0])
    );
  }, [filtered]);

  return (
    <div>
      <p className="hint">
        Every init option in the free self-hosted package (
        <code>tinymce@8.9.3</code>). Names are auto-extracted from{' '}
        <code>tinymce.d.ts</code>. <strong>All of these are free</strong> under
        GPLv2+.
      </p>

      <div className="filters">
        <input
          className="search"
          placeholder={`Search ${EDITOR_OPTIONS.length} options…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="count">
          {filtered.length} / {EDITOR_OPTIONS.length}
        </span>
      </div>

      {grouped.map(([category, options]) => (
        <section key={category} className="group">
          <h3>
            {category} <span className="pill">{options.length}</span>
          </h3>
          <table className="options">
            <tbody>
              {options.map((o) => (
                <tr key={o.name}>
                  <td className="opt-name">{o.name}</td>
                  <td>
                    {o.desc}
                    {o.example && <code className="eg">{o.example}</code>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {filtered.length === 0 && <p className="hint">No matches.</p>}
    </div>
  );
}
