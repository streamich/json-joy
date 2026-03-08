import * as React from 'react';
import {UrlDisplayLayout} from '../../../../components/UrlDisplayLayout';
import type {ViewProps} from '../../../InlineSliceBehavior';

export const View: React.FC<ViewProps> = ({formatting}) => {
  const data = formatting.range.data() as {href: string; title?: string};
  if (!data || typeof data !== 'object') return;
  return <UrlDisplayLayout url={data.href ?? ''} title={data.title} />;
};
