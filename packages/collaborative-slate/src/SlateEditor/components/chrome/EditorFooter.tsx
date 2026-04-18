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

const statusPathClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '12px',
  fw: 'wrap',
  minW: '0',
});

const pathLinkClass = rule({
  d: 'inline-block',
  maxW: '220px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'bottom',
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
  const caretPath = state.caretPath.use();
  const caretLinkHref = state.caretLinkHref.use();

  const infoColor = styles.light ? styles.g(0.34) : styles.g(0.68);
  const selectionSummary = selectionText
    ? `${pluralize(getWordCount(selectionText), 'word')} selected`
    : '';
  const statusText = readOnly ? 'Read-only' : focused ? 'Editing' : '';
  const linkColor = styles.light ? '#0b63ce' : '#76b6ff';

  return (
    <div className={footerClass} style={{color: infoColor}}>
      <div className={footerGroupClass}>
        {!!statusText && <Label>{statusText}</Label>}
        {!readOnly && focused && !!caretPath && (
          <span className={statusPathClass}>
            {caretPath.map((segment, index) => (
              <>
                <span>{segment}</span>
                {index < caretPath.length - 1 && <span style={{opacity:.25}}>{'→'}</span>}
              </>
            ))}
            {!!caretLinkHref && (
              <>
                <span style={{opacity:.25}}>{'→'}</span>
                <a
                  className={pathLinkClass}
                  href={caretLinkHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={caretLinkHref}
                  style={{color: linkColor}}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                >
                  {caretLinkHref}
                </a>
              </>
            )}
          </span>
        )}
      </div>

      <div className={footerGroupClass}>
        {!!selectionSummary && (
          <>
            <span>{selectionSummary}</span>
            <span style={{opacity:.25}}>{'•'}</span>
          </>
        )}
        <span>{pluralize(wordCount, 'word')}</span>
        <span style={{opacity:.25}}>{'•'}</span>
        <span>{pluralize(characterCount, 'character')}</span>
      </div>
    </div>
  );
};