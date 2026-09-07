import * as React from 'react';
import {ToolbarMenu} from '../Toolbar/ToolbarMenu';
import type {ContextPaneProps} from '../ContextMenu';
import type {MenuItem} from '../StructuralMenu/types';

export type FieldActionsPane = boolean | ContextPaneProps;

export interface FieldActionsProps {
  /** Leaf action items (`icon` + `name` tooltip + `onSelect`). */
  actions: MenuItem[];
  /** Fade in when true (typically on row hover). */
  visible?: boolean;
  /** Pane around the action buttons. Defaults to a compact pane; pass `false`
   * for bare buttons or a {@link ContextPaneProps} object to customize. */
  pane?: FieldActionsPane;
}

/** The right-side action strip of a field row */
export const FieldActions: React.FC<FieldActionsProps> = ({actions, visible, pane = {compact: true}}) => {
  if (!actions.length) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flex: '0 0 auto',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity .12s',
      }}
    >
      <ToolbarMenu small pane={pane} menu={{name: '', children: actions}} />
    </span>
  );
};
