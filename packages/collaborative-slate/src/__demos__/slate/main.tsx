import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {SlateEditor} from './SlateEditor';

const div = document.createElement('div');
div.id = 'root';
document.body.style.margin = '0';
document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
document.body.appendChild(div);

const App: React.FC = () => {
  return (
    <div style={{maxWidth: '800px', margin: '32px auto', padding: '0 16px'}}>
      <h1>Slate.js Rich-Text Editor Demo</h1>
      <p style={{color: '#666'}}>
        This demo shows the Slate.js editor with basic rich-text formatting.
        Use keyboard shortcuts: <strong>Ctrl/Cmd+B</strong> for bold,{' '}
        <em>Ctrl/Cmd+I</em> for italic, <u>Ctrl/Cmd+U</u> for underline.
      </p>
      <SlateEditor />
    </div>
  );
};

const root = createRoot(div);
root.render(<App />);
