import * as React from 'react';
import {md as mdParser} from '../../../markdown/parser';
import DocsMarkdown from './index';

export interface Props {
  md: string;
  fontSize?: number;
  font1?: boolean;
}

const DocsMd: React.FC<Props> = React.memo(({md, fontSize, font1}) => {
  const ast = React.useMemo(() => mdParser(md), [md]);

  return <DocsMarkdown ast={ast} fontSize={fontSize} font1={font1} />;
});

export default DocsMd;
