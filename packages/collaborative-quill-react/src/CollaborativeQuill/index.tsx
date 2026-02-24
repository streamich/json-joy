import * as React from 'react';
import Quill, {type QuillOptions} from 'quill';
import QuillCursors from 'quill-cursors';
import {bind, QuillPresence} from '@jsonjoy.com/collaborative-quill';
import {loadCss} from './loadCss';
import type {QuillDeltaApi} from 'json-joy/lib/json-crdt-extensions/quill-delta/QuillDeltaApi';
import {opts} from './constants';
import type {OnEditorChange, OnSelectionChange, OnTextChange} from '@jsonjoy.com/collaborative-quill';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

// Register quill-cursors module globally (idempotent — Quill ignores
// duplicate registrations).
Quill.register('modules/cursors', QuillCursors);

export interface CollaborativeQuillProps extends React.HTMLAttributes<HTMLDivElement> {
  api: () => QuillDeltaApi | undefined;
  editor?: Quill;
  readonly?: boolean;
  options?: QuillOptions;
  themeCss?: string;
  /** When provided, remote peer cursors and selections are rendered via
   * `quill-cursors` and the local selection is broadcast to the manager. */
  presence?: PresenceManager;
  /** Extracts user info from PresenceManager peer metadata. Defaults to
   * treating meta as `{ name?: string; color?: string }`. */
  userFromMeta?: (meta: any) => {name?: string; color?: string} | undefined;
  onEditor?: (quill: Quill) => void;
  onTextChange?: OnTextChange;
  onSelectionChange?: OnSelectionChange;
  onEditorChange?: OnEditorChange;
}

export const CollaborativeQuill: React.FC<CollaborativeQuillProps> = ({
  api,
  options = {...opts},
  readonly,
  themeCss,
  presence: presenceManager,
  userFromMeta,
  onEditor,
  onTextChange,
  onSelectionChange,
  onEditorChange,
  ...rest
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  options.readOnly = readonly;

  // When a presence manager is provided, enable the quill-cursors module.
  if (presenceManager) {
    options.modules = {...(options.modules ?? {}), cursors: true};
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: editor is intentionally recreated only when display options change
  React.useEffect(() => {
    const div = ref.current;
    if (!div) return;
    if (!themeCss) themeCss = `https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.${options.theme || 'snow'}.css`;
    loadCss(themeCss, themeCss);
    const editor = new Quill(div, options);
    const unbind = bind(api, editor);
    onEditor?.(editor);

    // Set up presence if a PresenceManager was supplied.
    let presence: QuillPresence | undefined;
    if (presenceManager) {
      presence = new QuillPresence({
        quill: editor,
        manager: presenceManager,
        api,
        userFromMeta: userFromMeta ?? ((m: any) => m),
      });
    }

    const handleChange: OnEditorChange = (eventName: 'text-change' | 'selection-change', ...args: unknown[]) => {
      switch (eventName) {
        case 'text-change':
          (onTextChange as any)?.(...args);
          break;
        case 'selection-change':
          (onSelectionChange as any)?.(...args);
          break;
      }
      (onEditorChange as any)?.(eventName, ...args);
    };
    editor.on('editor-change', handleChange);
    return () => {
      presence?.destroy();
      unbind();
      editor.off('editor-change', handleChange);
    };
  }, [options.theme, options.readOnly, options.debug, options.placeholder, presenceManager]);

  return <div {...rest} ref={ref} />;
};
