import type * as React from 'react';
import type {FocusViewProps} from './selection/FocusView';
import type {CaretViewProps} from './selection/CaretView';
import type {AnchorViewProps} from './selection/AnchorView';
import type {InlineViewProps} from './InlineView';
import type {BlockViewProps} from './BlockView';
import type {PeritextViewProps} from './PeritextView';
import type {PeritextSurfaceContextValue} from './context';

export interface RendererMap {
  focus?: (props: FocusViewProps, children: React.ReactNode) => React.ReactNode;
  caret?: (props: CaretViewProps, children: React.ReactNode) => React.ReactNode;
  anchor?: (props: AnchorViewProps, children: React.ReactNode) => React.ReactNode;
  inline?: (
    props: InlineViewProps,
    children: React.ReactNode,
    attributes: React.HTMLAttributes<HTMLSpanElement>,
  ) => React.ReactNode;
  block?: (props: BlockViewProps, children: React.ReactNode) => React.ReactNode;
  peritext?: (
    props: PeritextViewProps,
    children: React.ReactNode,
    ctx?: PeritextSurfaceContextValue,
  ) => React.ReactNode;
}
