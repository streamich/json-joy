import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {PlateEditor} from './PlateEditor';

// Setup styles for Plate demo - more modern/polished look
const style = document.createElement('style');
style.textContent = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
  ::selection {
    background: #a5b4fc;
  }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
`;
document.head.appendChild(style);

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App: React.FC = () => {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '48px 24px',
      minHeight: '100vh',
    }}>
      <header style={{marginBottom: '32px', textAlign: 'center'}}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: 'white',
          margin: '0 0 12px 0',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          letterSpacing: '-0.02em',
        }}>
          Plate.js Editor
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          margin: 0,
          lineHeight: 1.6,
          fontSize: '1.125rem',
        }}>
          A modern rich-text editor powered by Plate.js + json-joy CRDTs
        </p>
      </header>
      
      <PlateEditor />
      
      <footer style={{
        marginTop: '32px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
      }}>
        Part of{' '}
        <a
          href="https://github.com/streamich/json-joy"
          style={{color: 'white', textDecoration: 'underline'}}
        >
          json-joy
        </a>
        {' '}— @jsonjoy.com/collaborative-slate
      </footer>
    </div>
  );
};

const root = createRoot(div);
root.render(<App />);
