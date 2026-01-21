import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {SlateEditor} from './SlateEditor';

// Setup basic styles
const style = document.createElement('style');
style.textContent = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    background: #f8fafc;
    min-height: 100vh;
  }
  ::selection {
    background: #c7d2fe;
  }
`;
document.head.appendChild(style);

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App: React.FC = () => {
  return (
    <div style={{maxWidth: '860px', margin: '0 auto', padding: '40px 24px'}}>
      <header style={{marginBottom: '32px'}}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 8px 0',
        }}>
          Slate.js Editor Demo
        </h1>
        <p style={{color: '#64748b', margin: 0, lineHeight: 1.6}}>
          A minimal rich-text editor built with vanilla Slate.js, demonstrating integration
          with <strong>json-joy</strong> CRDTs for collaborative editing.
        </p>
      </header>
      <SlateEditor />
      <footer style={{
        marginTop: '24px',
        padding: '16px 0',
        borderTop: '1px solid #e2e8f0',
        color: '#94a3b8',
        fontSize: '14px',
      }}>
        Part of <a href="https://github.com/streamich/json-joy" style={{color: '#6366f1'}}>json-joy</a> —
        @jsonjoy.com/collaborative-slate
      </footer>
    </div>
  );
};

const root = createRoot(div);
root.render(<App />);
