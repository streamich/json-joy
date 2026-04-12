import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  maxW: '900px',
  mx: 'auto',
  px: '32px',
});

export const HomePage: React.FC = () => (
  <div className={blockClass}>
    home
  </div>
);
