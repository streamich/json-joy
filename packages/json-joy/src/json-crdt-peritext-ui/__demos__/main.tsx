import {createRoot} from 'react-dom/client';
import * as React from 'react';
import {App} from './components/App';

const div = document.createElement('div');
document.body.appendChild(div);

const root = createRoot(div);
root.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
);
