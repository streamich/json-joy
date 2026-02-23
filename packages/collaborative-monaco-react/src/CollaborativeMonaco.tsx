import * as React from 'react';
import {bind, MonacoPresence} from '@jsonjoy.com/collaborative-monaco';
import {Editor, type EditorProps} from '@monaco-editor/react';
import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {MonacoPresenceOpts} from '@jsonjoy.com/collaborative-monaco';

export interface CollaborativeMonacoProps extends EditorProps {
  str: () => CollaborativeStr;
  /** When supplied, remote cursors and selections are rendered. */
  presence?: PresenceManager;
  /** Extract user info (name, color) from the presence meta payload. */
  userFromMeta?: MonacoPresenceOpts<any>['userFromMeta'];
}

export const CollaborativeMonaco: React.FC<CollaborativeMonacoProps> = ({str, presence, userFromMeta, ...rest}) => {
  const unbind = React.useRef<(() => void) | null>(null);
  const presenceRef = React.useRef<MonacoPresence | null>(null);
  React.useEffect(() => {
    return () => {
      unbind.current?.();
      presenceRef.current?.destroy();
    };
  }, []);

  const handleMount = (editor: any, monaco: any) => {
    unbind.current?.();
    presenceRef.current?.destroy();
    unbind.current = bind(str, editor, true);
    if (presence) {
      presenceRef.current = new MonacoPresence({
        editor,
        manager: presence,
        str: () => str() as any,
        userFromMeta,
      });
    }
    rest.onMount?.(editor, monaco);
  };

  return <Editor {...rest} onMount={handleMount} />;
};
