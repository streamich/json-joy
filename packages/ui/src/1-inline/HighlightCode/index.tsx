import * as React from 'react';
import {ColorTokens} from 'code-colors-react';

export interface HighlightCodeProps {
  code: string;
  lang?: string;
}

export const HighlightCode: React.FC<HighlightCodeProps> = React.memo(({code, lang}) => {
  return <ColorTokens code={code} lang={lang} as={'code'} />;
});

export default HighlightCode;
