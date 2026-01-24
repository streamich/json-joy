import * as React from 'react';
import {bind} from '@jsonjoy.com/collaborative-monaco';
import {Editor, type EditorProps} from '@monaco-editor/react';
import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';

export interface CollaborativeMonacoProps extends EditorProps {
  str: () => CollaborativeStr;
}

export const CollaborativeMonaco: React.FC<CollaborativeMonacoProps> = ({str, ...rest}) => {
  const unbind = React.useRef<(() => void) | null>(null);
  React.useEffect(() => {
    return () => {
      unbind.current?.();
    };
  }, []);

  const handleMount = (editor: any, monaco: any) => {
    unbind.current?.();
    unbind.current = bind(str, editor, true);
    rest.onMount?.(editor, monaco);
  };

  return <Editor {...rest} onMount={handleMount} />;
};
