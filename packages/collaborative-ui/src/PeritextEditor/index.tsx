import React, {useMemo} from 'react';
import {CursorPlugin} from '../PeritextWebUi/plugins/cursor';
import {PeritextWebUi, type PeritextWebUiProps} from '../PeritextWebUi';
import {ToolbarPlugin} from './ToolbarPlugin';

export interface PeritextEditorProps extends PeritextWebUiProps {
  /**
   * Plugins applied to the editor before the default ones.
   */
  plugins0?: PeritextWebUiProps['plugins'];
}

export const PeritextEditor: React.FC<PeritextEditorProps> = (props) => {
  const plugins = useMemo(() => {
    return [...(props.plugins0 || []), new CursorPlugin(), new ToolbarPlugin(), ...(props.plugins || [])];
  }, [props.plugins]);

  return <PeritextWebUi {...props} plugins={plugins} />;
};
