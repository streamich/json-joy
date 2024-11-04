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
  inline?: (props: InlineRendererProps) => React.ReactNode;
  block?: (props: BlockViewProps, children: React.ReactNode) => React.ReactNode;
  peritext?: (
    props: PeritextViewProps,
    children: React.ReactNode,
    ctx?: PeritextSurfaceContextValue,
  ) => React.ReactNode;
}

export interface InlineRendererProps extends InlineViewProps {
  children: React.ReactNode;
  span: HTMLSpanElement | null;
}
