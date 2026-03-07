import * as React from 'react';
import {ColorDisplayLayout} from '../../../components/color-display/ColorDisplayLayout';
import type {ColorSliceData} from './types';
import type {ViewProps} from '../../../types';

export const View: React.FC<ViewProps> = ({formatting, onEdit}) => {
  const data = formatting.range.data() as ColorSliceData;
  if (!data || typeof data !== 'object') return;
  return <ColorDisplayLayout color={data.col ?? ''} onPreviewClick={() => onEdit()} />;
};
