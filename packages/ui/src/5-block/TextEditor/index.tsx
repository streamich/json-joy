import * as React from 'react';
import {createEditor} from './loadCodeMirror';
import type {CodeMirrorEditor} from './types';
import {rule, theme, useRule} from 'nano-theme';
import type {EditorControls} from './types';

const {useEffect, useRef, useState, useMemo, useCallback} = React;

const blockClass = rule({
  '& .cm-editor': {
    ...theme.font.mono,
    outline: 'none',
  },
  '& .cm-scroller': {
    overflow: 'auto',
  },
  '& .cm-placeholder': {
    opacity: 0.5,
  },
});

const defaultFontSize = 15;
const defaultLineHeight = 1.5;

export interface Props {
  className?: string;
  fontSize?: number;
  placeholder?: string;
  lineHeight?: number;
  showAllLines?: boolean;
  minLines?: number;
  disabled?: boolean;
  onChange?: (controls: EditorControls) => void;
  onControls?: (controls: EditorControls) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const TextEditor: React.FC<Props> = (props) => {
  const dynamicClass = useRule((theme) => ({
    '& .cm-editor': {
      color: theme.name === 'dark' ? '#ddd' : '#000',
    },
    '& .cm-selectionBackground': {
      backgroundColor: `${theme.isLight ? theme.g(0.9) : theme.g(0.3)} !important`,
    },
    '& .cm-cursor': {
      borderLeftColor: theme.g(0, 0.5),
    },
  }));
  const fontSize = props.fontSize || defaultFontSize;
  const lineHeightInPx = Math.round(fontSize * (props.lineHeight || defaultLineHeight));
  const {className, minLines = 1, onFocus, onBlur, disabled} = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<CodeMirrorEditor | null>(null);
  const editorRef = useRef<CodeMirrorEditor | null>(null);

  const controls = useMemo<undefined | EditorControls>(() => {
    if (!editor) return;
    const controls: EditorControls = {
      getValue: () => editor.state.doc.toString(),
      getSelectionValue: () => {
        const state = editor.state;
        return state.sliceDoc(state.selection.main.from, state.selection.main.to);
      },
      setValue: (value: string) => {
        editor.dispatch({
          changes: {from: 0, to: editor.state.doc.length, insert: value},
        });
      },
      insert: (text: string, select?: 'around' | 'start') => {
        const {from, to} = editor.state.selection.main;
        editor.dispatch({
          changes: {from, to, insert: text},
          selection:
            select === 'around'
              ? {anchor: from, head: from + text.length}
              : select === 'start'
                ? {anchor: from}
                : {anchor: from + text.length},
        });
      },
      clear: () => {
        editor.dispatch({
          changes: {from: 0, to: editor.state.doc.length, insert: ''},
        });
      },
      focus: () => editor.focus(),
      blur: () => editor.contentDOM.blur(),
      gotoEnd: () => {
        const length = editor.state.doc.length;
        editor.dispatch({selection: {anchor: length}});
        editor.focus();
      },
      hasFocus: () => editor.hasFocus,
      selectAll: () => {
        editor.dispatch({selection: {anchor: 0, head: editor.state.doc.length}});
      },
    };
    return controls;
  }, [editor]);

  const handleChange = useCallback(() => {
    if (controls && props.onChange) {
      props.onChange(controls);
    }
  }, [controls, props.onChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (editorRef.current) return;

    const view = createEditor({
      parent: containerRef.current,
      placeholder: props.placeholder,
      onFocus,
      onBlur,
      onChange: handleChange,
    });

    editorRef.current = view;
    setEditor(view);

    return () => {
      view.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (controls && props.onControls) props.onControls(controls);
  }, [controls]);

  useEffect(() => {
    if (!editor) return;
    editor.contentDOM.contentEditable = disabled ? 'false' : 'true';
  }, [editor, disabled]);

  const style: React.CSSProperties = {
    fontSize: fontSize + 'px',
    lineHeight: lineHeightInPx + 'px',
  };

  if (props.showAllLines) {
    const minHeight = 10 + minLines * lineHeightInPx;
    style.minHeight = minHeight + 'px';
  }

  return <div className={(className || '') + blockClass + dynamicClass} style={style} ref={containerRef} />;
};
