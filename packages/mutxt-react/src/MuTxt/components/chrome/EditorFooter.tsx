import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Label} from '@jsonjoy.com/ui/lib/1-inline/Label';
import {Favicon} from '@jsonjoy.com/ui/lib/1-inline/Favicon';
import {CopyCode} from '@jsonjoy.com/ui/lib/1-inline/CopyCode';
import {useMuTxt} from '../../context';
import {getWordCount, pluralize} from '../../util';
import {typeToLabel} from '../../util/typeToLabel';

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
});

const pathLinkClass = rule({
  d: 'inline-block',
  maxW: '220px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'bottom',
  textDecoration: 'underline',
  textDecorationThickness: '1px',
  textUnderlineOffset: '4px',
  textDecorationColor: 'rgb(from currentColor r g b / 0.2)',
  '&:hover': {
    textDecorationColor: 'currentColor',
  },
});

export interface EditorFooterProps {}

export const EditorFooter: React.FC<EditorFooterProps> = () => {
  const styles = useStyles();
  const state = useMuTxt();
  const focused = state.focused.use();
  const readOnly = state.readOnly.use();
  const wordCount = state.wordCount.use();
  const characterCount = state.characterCount.use();
  const selectionText = state.selectionText.use();
  const caretPath = state.caretPath.use();
  const caretLinkHref = state.caretLinkHref.use();
  const caretEmbedUrl = state.caretEmbedUrl.use();
  const caretCodeText = state.caretCodeText.use();

  const infoColor = styles.light ? styles.g(0.34) : styles.g(0.68);
  const selectionSummary = selectionText
    ? `${pluralize(getWordCount(selectionText), 'word')} (${pluralize(selectionText.length, 'char')}) selected`
    : '';
  const statusText = readOnly ? 'Read-only' : focused ? 'Editing' : '';
  const footerUrl = caretEmbedUrl || caretLinkHref;

  return (
    <div className={footerClass} style={{color: infoColor}}>
      <div className={footerGroupClass}>
        {!!statusText && <Label>{statusText}</Label>}
        {!readOnly && focused && !!caretPath && (
          <span className={statusPathClass}>
            {caretPath.map((segment, index) => (
              <React.Fragment key={`${index}:${segment}`}>
                <span>{typeToLabel(segment) || segment}</span>
                {index < caretPath.length - 1 && <span style={{opacity:.25}}>{'→'}</span>}
              </React.Fragment>
            ))}
            {!!footerUrl && (
              <>
                <span style={{opacity:.25}}>{'→'}</span>
                <Favicon url={footerUrl} size={16} />
                <a
                  className={pathLinkClass}
                  href={footerUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={footerUrl}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                >
                  {footerUrl}
                </a>
              </>
            )}
            {!!caretCodeText && (
              <>
                <span style={{opacity:.25}}>{'→'}</span>
                <CopyCode value={caretCodeText} truncate style={{maxWidth: 220}} alt spacious roundest />
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