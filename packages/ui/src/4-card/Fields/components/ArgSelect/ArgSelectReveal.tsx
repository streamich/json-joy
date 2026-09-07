import * as React from 'react';
import type {ParamSelect} from '../../../StructuralMenu/types';
import {ValueCell} from '../../ValueCell';
import {SelectMenuBody} from './SelectMenuBody';

export interface ArgSelectRevealProps {
  param: ParamSelect;
  value: unknown;
  onChange: (value: unknown) => void;
  align?: 'left' | 'right';
  /** Whether the cell fills the row width (card/block) or hugs its content. @default true */
  stretch?: boolean;
}

/**
 * The `reveal` edit-mode presentation of a select field. Reuses {@link ValueCell}
 * for the full-width ghost value cell (resting label/chips + hover highlight) and
 * its popover machinery, but a single click opens the options dropdown directly
 * — one click to open, one to pick (single closes; multi stays open to toggle).
 */
export const ArgSelectReveal: React.FC<ArgSelectRevealProps> = ({
  param,
  value,
  onChange,
  align = 'left',
  stretch = true,
}) => (
  <ValueCell
    param={param}
    value={value}
    onChange={onChange}
    align={align}
    stretch={stretch}
    barePopover
    renderPopover={(ctx) => <SelectMenuBody param={param} value={ctx.value} onChange={ctx.onChange} />}
  />
);
