import * as React from 'react';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {BlockText} from './BlockText';
import {CopyButton} from '../CopyButton';
import {rule} from 'nano-theme';
import {CodeblockLayout} from '../CodeblockLayout';

const css = {
  block: rule({
    pd: 0,
    mr: 0,
    pre: {
      mr: 0,
    },
  }),
};

export interface TextBlockProps {
  src: string;
  header?: React.ReactNode;
  compact?: boolean;
}

export const TextBlock: React.FC<TextBlockProps> = ({src, header, compact}) => {
  return (
    <div className={css.block}>
      <CodeblockLayout>
        <Split>
          <div>{header}</div>
          <CopyButton onCopy={() => src} />
        </Split>
        <div style={{margin: compact ? '-24px 0 -4px' : '-20px 0 0', maxWidth: '100%', overflowX: 'auto'}}>
          <BlockText src={src} compact={compact} />
        </div>
      </CodeblockLayout>
    </div>
  );
};
