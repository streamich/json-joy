import * as React from 'react';
import {UiProvider} from '@jsonjoy.com/ui';
import {createRoot} from 'react-dom/client';
import {App} from './App';

import 'nano-theme/lib/global-reset';

const root = document.getElementById('root')!;
createRoot(root).render(
  <React.StrictMode>
    <UiProvider globalCss>
      <App />
    </UiProvider>
  </React.StrictMode>,
);
