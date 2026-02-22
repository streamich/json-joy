import * as React from 'react';
import {rule} from 'nano-theme';
import {fonts} from '@jsonjoy.com/ui/lib/styles';
import type {BlockViewProps} from '../../../web/react/BlockView';

const blockClass = rule({
  ...fonts.get('mono', 'mid'),
  bg: 'rgba(0,0,0,.02)',
  // pd: '16px',
  pd: 'calc(max(16px, 1em))',
  bdrad: 'calc(max(16px, 1em))',
  fz: '.85em',
  lh: '1.4em',
});

export interface CodeblockProps extends BlockViewProps {
  children: React.ReactNode;
}

export const Codeblock: React.FC<CodeblockProps> = ({block, children}) => {
  return (
    <pre className={blockClass}>
      <code>{children}</code>
    </pre>
  );
};
