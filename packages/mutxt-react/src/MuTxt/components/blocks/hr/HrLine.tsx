import * as React from 'react';
import {Line} from '@jsonjoy.com/ui/lib/3-list-item/Line';
import type {HrLineStyle} from '../../../types';

export type HrLineOrientation = 'horizontal' | 'vertical';

export interface HrLineProps {
  strokeWidth: number;
  style: HrLineStyle;
  orientation?: HrLineOrientation;
}

export const HrLine: React.FC<HrLineProps> = Line;
