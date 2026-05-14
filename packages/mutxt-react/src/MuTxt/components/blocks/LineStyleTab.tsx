import * as React from 'react';
import {rule} from 'nano-theme';
import {HrLine} from './hr/HrLine';
import type {HrLineStyle} from '../../types';

const PREVIEW_WIDTH = 24;

const previewWrapClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: `${PREVIEW_WIDTH}px`,
  minH: '16px',
});

export interface LineStylePreviewProps {
  style: HrLineStyle;
  strokeWidth?: number;
}

/**
 * Tiny horizontal stroke preview used inside option pickers to show what
 * each line-style choice looks like (solid / dashed / dotted / squiggly).
 */
export const LineStylePreview: React.FC<LineStylePreviewProps> = ({style, strokeWidth = 2}) => (
  <span className={previewWrapClass} aria-hidden="true">
    <HrLine strokeWidth={strokeWidth} style={style} />
  </span>
);

export interface LineStyleTabLabelProps {
  style: HrLineStyle;
  label: string;
  strokeWidth?: number;
}

export const LineStyleTabLabel: React.FC<LineStyleTabLabelProps> = ({style, label, strokeWidth = 2}) => (
  <span
    role="img"
    title={label}
    aria-label={label}
    style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
  >
    <LineStylePreview style={style} strokeWidth={strokeWidth} />
  </span>
);
