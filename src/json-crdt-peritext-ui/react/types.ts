import * as React from 'react';
import type {FocusViewProps} from './selection/FocusView';
import type {CaretViewProps} from './selection/CaretView';
import type {AnchorViewProps} from './selection/AnchorView';

export interface RendererMap {
  focus?: (props: FocusViewProps, children: React.ReactNode) => React.ReactNode;
  caret?: (props: CaretViewProps, children: React.ReactNode) => React.ReactNode;
  anchor?: (props: AnchorViewProps, children: React.ReactNode) => React.ReactNode;
}
