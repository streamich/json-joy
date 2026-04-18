import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Label} from '@jsonjoy.com/ui/lib/1-inline/Label';
import {useSlateEditorState} from '../../context';
import {getWordCount, pluralize} from '../../util';

const footerClass = rule({
  d: 'flex',
  jc: 'space-between',
  ai: 'center',
  fw: 'wrap',
  gap: '12px',
  pd: '0 18px',
  h: '48px',
  fz: '12px',
});

const footerGroupClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '12px',
  fw: 'wrap',
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
  const selectionSummary = selectionText
    ? `${pluralize(getWordCount(selectionText), 'word')} selected`
    : '';

  return (
    <div className={footerClass} style={{color: infoColor}}>
      <div className={footerGroupClass}>
        <span>{pluralize(wordCount, 'word')}</span>
        <span style={{opacity:.25}}>{'•'}</span>
        <span>{pluralize(characterCount, 'character')}</span>
        {!!selectionSummary && (
          <>
            <span style={{opacity:.25}}>{'•'}</span>
            <span>{selectionSummary}</span>
          </>
        )}
      </div>

      <div className={footerGroupClass}>
        <Label>
          {readOnly ? 'Read-only' : focused ? 'Editing' : ''}
        </Label>
      </div>
    </div>
  );
};