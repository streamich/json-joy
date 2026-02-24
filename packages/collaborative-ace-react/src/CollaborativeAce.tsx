import * as React from 'react';
import AceEditor, {type IAceEditorProps} from 'react-ace';
import {bind, AcePresence} from '@jsonjoy.com/collaborative-ace';
import type {AcePresenceOpts, PresenceUser} from '@jsonjoy.com/collaborative-ace';
import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {Ace} from 'ace-builds';

export type Editor = Ace.Editor;

export interface CollaborativeAceProps<Meta extends object = object> extends Omit<IAceEditorProps, 'onLoad' | 'value'> {
  str: () => CollaborativeStr;
  polling?: boolean;
  onLoad?: (editor: Editor) => void;
  /** When provided, enables remote cursor/selection rendering. */
  presence?: PresenceManager<Meta>;
  /** Extracts display info (name, color) from the presence `meta` payload. */
  userFromMeta?: (meta: Meta) => PresenceUser | undefined;
  /** Extra options forwarded to the underlying {@link AcePresence} instance. */
  presenceOpts?: Partial<AcePresenceOpts<Meta>>;
}

export const CollaborativeAce = <Meta extends object = object>({
  str,
  polling,
  onLoad,
  presence,
  userFromMeta,
  presenceOpts,
  ...rest
}: CollaborativeAceProps<Meta>): React.ReactElement => {
  const unbindRef = React.useRef<() => void>(null);
  const editorRef = React.useRef<Ace.Editor>(null);
  const presenceRef = React.useRef<AcePresence<Meta>>(null);

  React.useEffect(() => {
    return () => {
      unbindRef.current?.();
      presenceRef.current?.dispose();
    };
  }, []);

  const handleLoad = (editor: Ace.Editor) => {
    (editorRef.current as any) = editor;
    (unbindRef.current as any) = bind(str, editor, !!polling);

    // Set up presence if a manager was provided.
    if (presence) {
      (presenceRef.current as any) = new AcePresence(editor, {
        manager: presence,
        str: str as any,
        userFromMeta,
        ...presenceOpts,
      } as AcePresenceOpts<Meta>);
    }

    onLoad?.(editor);
  };

  return <AceEditor {...rest} value={str().view()} onLoad={handleLoad} />;
};
