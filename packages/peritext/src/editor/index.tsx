import React, {useMemo} from 'react';
import {CursorPlugin} from '../plugins/cursor';
import {PeritextWebUi, type PeritextWebUiProps} from '../web';
import {EditorPlugin} from './EditorPlugin';

export interface PeritextEditorProps extends PeritextWebUiProps {
  /**
   * Plugins applied to the editor before the default ones.
   */
  plugins0?: PeritextWebUiProps['plugins'];
}

export const PeritextEditor: React.FC<PeritextEditorProps> = (props) => {
  const plugins = useMemo(() => {
    return [...(props.plugins0 || []), new CursorPlugin(), new EditorPlugin(), ...(props.plugins || [])];
  }, [props.plugins, props.plugins0]);

  return <PeritextWebUi {...props} plugins={plugins} />;
};
