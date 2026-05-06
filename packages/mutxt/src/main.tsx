import * as React from 'react';
import {UiProvider} from '@jsonjoy.com/ui';
import {ErrorBoundary} from '@jsonjoy.com/ui/lib/misc/ErrorBoundary';
import {createRoot} from 'react-dom/client';
import {App} from './App';

window.addEventListener('error', (event) => {
  console.error('[mutxt] window error:', event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[mutxt] unhandled rejection:', event.reason);
});

const root = document.getElementById('root')!;
createRoot(root).render(
  <UiProvider>
    <ErrorBoundary name="mutxt:app">
      <App />
    </ErrorBoundary>
  </UiProvider>,
);
