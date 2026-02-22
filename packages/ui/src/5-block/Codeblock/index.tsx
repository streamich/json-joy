import * as React from 'react';
import HighlightCode from '../../1-inline/HighlightCode';
import {CodeblockLayout} from '../CodeblockLayout';

export interface CodeblockProps {
  src: string;
  lang?: string;
  compact?: boolean;
}

export const Codeblock: React.FC<CodeblockProps> = ({src, lang, compact}) => {
  return (
    <CodeblockLayout compact={compact}>
      {lang ? <HighlightCode code={src} lang={lang || undefined} /> : <code>{src}</code>}
    </CodeblockLayout>
  );
};
