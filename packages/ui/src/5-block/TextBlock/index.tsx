import * as React from 'react';
import {BlockText} from './BlockText';
import {rule} from 'nano-theme';
import {CodeblockLayout} from '../CodeblockLayout';
import {Split} from '../../3-list-item/Split';
import {CopyButton} from '../../2-inline-block/CopyButton';

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
  select?: boolean;
  lang?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({src, header, compact, select, lang}) => {
  return (
    <div className={css.block}>
      <CodeblockLayout>
        <Split>
          <div>{header}</div>
          <CopyButton onCopy={() => src} />
        </Split>
        <div style={{paddingRight: 24}}>
          <div style={{margin: compact ? '-24px 0 -4px' : '-20px 0 0', maxWidth: '100%', overflowX: 'auto'}}>
            <BlockText src={src} compact={compact} select={select} lang={lang} />
          </div>
        </div>
      </CodeblockLayout>
    </div>
  );
};
