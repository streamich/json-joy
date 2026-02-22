import * as React from 'react';
import AceEditor, {type IAceEditorProps} from 'react-ace';
import {bind} from '@jsonjoy.com/collaborative-ace';
import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';
import type {Ace} from 'ace-builds';

export type Editor = Ace.Editor;

export interface CollaborativeAceProps extends Omit<IAceEditorProps, 'onLoad' | 'value'> {
  str: () => CollaborativeStr;
  polling?: boolean;
  onLoad?: (editor: Editor) => void;
}

export const CollaborativeAce: React.FC<CollaborativeAceProps> = ({str, polling, onLoad, ...rest}) => {
  const unbindRef = React.useRef<() => void>(null);
  const editorRef = React.useRef<Ace.Editor>(null);

  React.useEffect(() => {
    return () => {
      unbindRef.current?.();
    };
  }, []);

  const handleLoad = (editor: Ace.Editor) => {
    (editorRef.current as any) = editor;
    (unbindRef.current as any) = bind(str, editor, !!polling);
    onLoad?.(editor);
  };

  return <AceEditor {...rest} value={str().view()} onLoad={handleLoad} />;
};
