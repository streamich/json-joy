import * as React from 'react';
import {ColorDisplayLayout} from '../../../components/ColorDisplayLayout';
import type {ColorSliceData} from './types';
import type {ViewProps} from '../../../types';

export const View: React.FC<ViewProps> = ({formatting}) => {
  const data = formatting.range.data() as ColorSliceData;
  if (!data || typeof data !== 'object') return;
  return <ColorDisplayLayout color={data.col ?? ''} text={data.col} />;
};
