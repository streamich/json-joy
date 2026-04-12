import * as React from 'react';
import {rule} from 'nano-theme';
import {NiceUiSizes} from '@jsonjoy.com/ui/lib/constants';

const blockClass = rule({
  d: 'flex',
  minH: '100vh',
});

export const DocsPage: React.FC = () => (
  <div className={blockClass}>
    <main>
      <h1>Documentation</h1>
    </main>
  </div>
);
