import * as React from 'react';
import {hydrateRoot, createRoot} from 'react-dom/client';
import {NiceUiNavService} from '@jsonjoy.com/ui/lib/context/services/NiceUiNavService';
import {PagesService} from './services/PagesService';
import {App} from './App';

import 'nano-theme/lib/global-reset';

const nav = new NiceUiNavService();
const pages = new PagesService(nav);

const rootEl = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <App pages={pages} />
  </React.StrictMode>
);

// Use hydrateRoot when SSR pre-rendered HTML is present (production),
// fall back to createRoot in dev (no pre-render step).
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
