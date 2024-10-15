import * as React from 'react';
import type {FocusViewProps} from './selection/FocusView';
import type {CaretViewProps} from './selection/CaretView';

export interface RendererMap {
  focus?: (children: React.ReactNode, props: FocusViewProps) => React.ReactNode;
  caret?: (children: React.ReactNode, props: CaretViewProps) => React.ReactNode;
}
