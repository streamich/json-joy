import * as React from 'react';
import Quill, {type QuillOptions} from 'quill';
import {bind} from '@jsonjoy.com/collaborative-quill';
import {loadCss} from './loadCss';
import {QuillDeltaApi} from 'json-joy/lib/json-crdt-extensions/quill-delta/QuillDeltaApi';
import {opts} from './constants';
import type {OnEditorChange, OnSelectionChange, OnTextChange} from '@jsonjoy.com/collaborative-quill';

export interface CollaborativeQuillProps extends React.HTMLAttributes<HTMLDivElement> {
  api: () => QuillDeltaApi | undefined;
  editor?: Quill;
  readonly?: boolean;
  options?: QuillOptions;
  themeCss?: string;
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
  onEditor,
  onTextChange,
  onSelectionChange,
  onEditorChange,
  ...rest
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  options.readOnly = readonly;

  React.useEffect(() => {
    const div = ref.current;
    if (!div) return;
    if (!themeCss) themeCss = `https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.${options.theme || 'snow'}.css`;
    loadCss(themeCss, themeCss);
    const editor = new Quill(div, options);
    const unbind = bind(api, editor);
    onEditor?.(editor);
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
      unbind();
      editor.off('editor-change', handleChange);
    };
  }, [options.theme, options.readOnly, options.debug, options.placeholder]);

  return <div {...rest} ref={ref} />;
};
