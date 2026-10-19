import { useMemo, useState } from 'react';
import { PLUGINS } from './data/plugins.js';
import { PREMIUM } from './data/premium.js';

export default function PluginsReference() {
  const [q, setQ] = useState('');
  const [showPremium, setShowPremium] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const source = showPremium ? PREMIUM : PLUGINS;
    if (!needle) return source;
    return source.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.desc.toLowerCase().includes(needle)
    );
  }, [q, showPremium]);

  return (
    <div>
      <div className="tabs subtle">
        <button
          className={!showPremium ? 'active' : ''}
          onClick={() => setShowPremium(false)}
        >
          Free plugins ({PLUGINS.length})
        </button>
        <button
          className={showPremium ? 'active' : ''}
          onClick={() => setShowPremium(true)}
        >
          Not free / premium ({PREMIUM.length})
        </button>
      </div>

      <p className="hint">
        {showPremium
          ? 'These are NOT in the self-hosted npm package — they need a paid plan or commercial license.'
          : 'Bundled with the free self-hosted npm package. Enable them via the "plugins" option.'}
      </p>

      <input
        className="search"
        placeholder="Search plugins…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {list.map((p) => (
        <section key={p.name} className="group">
          <h3>
            {p.name}
            {p.options?.length ? (
              <span className="pill">{p.options.length} options</span>
            ) : (
              <span className="pill muted">no options</span>
            )}
          </h3>
          <p className="plugin-desc">{p.desc}</p>
          {p.options?.length > 0 && (
            <table className="options">
              <tbody>
                {p.options.map((o) => (
                  <tr key={o.name}>
                    <td className="opt-name">{o.name}</td>
                    <td>{o.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}

      {list.length === 0 && <p className="hint">No matches.</p>}
    </div>
  );
}
