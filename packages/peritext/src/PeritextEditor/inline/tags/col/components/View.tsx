import * as React from 'react';
import {ColorDisplayLayout} from '../../../../components/color-display/ColorDisplayLayout';
import type {Data} from '../index';
import type {ViewProps} from '../../../InlineSliceBehavior';

export const View: React.FC<ViewProps> = ({formatting, onEdit}) => {
  const data = formatting.range.data() as Data;
  if (!data || typeof data !== 'object') return;
  return <ColorDisplayLayout color={data.col ?? ''} onPreviewClick={() => onEdit()} />;
};
