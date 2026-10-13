import { useState } from 'react';
import EditorDemo from './EditorDemo.jsx';
import EditorFull from './EditorFull.jsx';
import OptionsReference from './OptionsReference.jsx';
import PluginsReference from './PluginsReference.jsx';
import './App.css';

const TABS = [
  { id: 'options', label: 'All options' },
  { id: 'plugins', label: 'Plugins' },
  { id: 'full', label: 'Full editor (all free plugins)' },
  { id: 'editor', label: 'Default editor' },
];

export default function App() {
  const [tab, setTab] = useState('options');

  return (
    <div className="app">
      <header className="topbar">
        <h1>TinyMCE self-hosted</h1>
        <span className="badge">tinymce 8.9.3 · GPLv2+ · no API key</span>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="panel">
        {tab === 'options' && <OptionsReference />}
        {tab === 'plugins' && <PluginsReference />}
        {tab === 'full' && <EditorFull />}
        {tab === 'editor' && <EditorDemo />}
      </main>
    </div>
  );
}
