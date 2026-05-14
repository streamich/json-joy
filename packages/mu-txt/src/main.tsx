import * as React from 'react';
import {ErrorBoundary} from '@jsonjoy.com/ui/lib/misc/ErrorBoundary';
import {createRoot} from 'react-dom/client';
import {App} from './App';

import 'nano-theme/lib/global-reset';

window.addEventListener('error', (event) => {
  console.error('[mutxt] window error:', event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[mutxt] unhandled rejection:', event.reason);
});

const root = document.getElementById('root')!;
createRoot(root).render(
  <ErrorBoundary name="mutxt:app">
    <App />
  </ErrorBoundary>,
);
