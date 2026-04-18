import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useSlateEditorState} from '../../context';
import {getWordCount, pluralize} from '../../util';

const footerClass = rule({
  d: 'flex',
  jc: 'space-between',
  ai: 'center',
  fw: 'wrap',
  gap: '12px',
  pd: '12px 18px 16px',
  fz: '12px',
});

const footerGroupClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '12px',
  fw: 'wrap',
});

const chipClass = rule({
  d: 'inline-flex',
  ai: 'center',
  pad: '6px 10px',
  bdrad: '999px',
  fw: 600,
});

export interface EditorFooterProps {}

export const EditorFooter: React.FC<EditorFooterProps> = () => {
  const styles = useStyles();
  const state = useSlateEditorState();
  const focused = state.focused.use();
  const readOnly = state.readOnly.use();
  const wordCount = state.wordCount.use();
  const characterCount = state.characterCount.use();
  const selectionText = state.selectionText.use();

  const infoColor = styles.light ? styles.g(0.34) : styles.g(0.68);
  const chipStyle: React.CSSProperties = {
    background: styles.light ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.06)',
    color: styles.light ? styles.g(0.24) : styles.g(0.84),
  };

  const selectionSummary = selectionText
    ? `${pluralize(getWordCount(selectionText), 'word')} selected`
    : focused
      ? 'Shortcuts: Cmd+B / Cmd+Alt+1 / Cmd+Shift+J'
      : 'Click into the editor to start writing';

  return (
    <div className={footerClass} style={{color: infoColor}}>
      <div className={footerGroupClass}>
        <span>{pluralize(wordCount, 'word')}</span>
        <span>{pluralize(characterCount, 'character')}</span>
        <span>{selectionSummary}</span>
      </div>

      <div className={footerGroupClass}>
        <span className={chipClass} style={chipStyle}>
          {readOnly ? 'Read-only' : focused ? 'Editing' : 'Ready'}
        </span>
      </div>
    </div>
  );
};