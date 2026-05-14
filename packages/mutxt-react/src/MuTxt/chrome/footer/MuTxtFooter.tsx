import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Label} from '@jsonjoy.com/ui/lib/1-inline/Label';
import {Favicon} from '@jsonjoy.com/ui/lib/1-inline/Favicon';
import {CopyCode} from '@jsonjoy.com/ui/lib/1-inline/CopyCode';
import {CopyButton} from '@jsonjoy.com/ui/lib/2-inline-block/CopyButton';
import {Breadcrumb, Breadcrumbs} from '@jsonjoy.com/ui/lib/3-list-item/Breadcrumbs';
import {useMuTxt} from '../../context';
import {getWordCount, pluralize} from '../../util';
import {typeToLabel} from '../../util/typeToLabel';
import {TranslitFooterPill} from '../../translit/TranslitFooterPill';
import type {MathThing} from '../../types';

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
  ws: 'nowrap',
  ov: 'hidden',
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

export type MuTxtFooterProps = {};

export const MuTxtFooter: React.FC<MuTxtFooterProps> = () => {
  const styles = useStyles();
  const state = useMuTxt();
  const footerRef = React.useRef<HTMLDivElement>(null);
  const availableWidth = state.sizer.width.use();
  const desiredWidth = state.sizer.content.use();
  const focused = state.focused.use();
  const linkOpen = state.inline.link.open.use();
  const readOnly = state.readOnly.use();
  const wordCount = state.wordCount.use();
  const characterCount = state.characterCount.use();
  const selectionText = state.selectionText.use();
  const caretPath = state.caretPath.use();
  const caretLinkHref = state.caretLinkHref.use();
  const caretEmbedUrl = state.caretEmbedUrl.use();
  const caretCodeText = state.caretCodeText.use();
  const caretMathThingId = state.caretMathThingId.use();
  state.things.version.use();
  const caretMathTex = caretMathThingId
    ? ((state.things.get(caretMathThingId) as MathThing | undefined)?.val ?? '')
    : '';

  const width = Math.min(availableWidth, desiredWidth);

  const infoColor = styles.g(0.34);
  const selectionSummary = selectionText
    ? `${pluralize(getWordCount(selectionText), 'word')} (${pluralize(selectionText.length, 'char')}) selected`
    : '';
  const statusText = readOnly ? 'Read-only' : focused ? 'Editing' : '';
  const footerUrl = caretEmbedUrl || caretLinkHref;

  const showCaretPath = width > 700;
  const showCaretCode = width > 900;
  const showCaretUrl = width > 1100;
  const showCharacterCount = width > 500;
  const showSelectionSummary = width > 600;

  const preventBreadcrumbMouseDown = (event: React.MouseEvent): void => {
    event.preventDefault();
  };

  const handleLinkBreadcrumbClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    const shell = state.shellEl;
    const footer = footerRef.current;
    if (!shell || !footer) return;
    const shellRect = shell.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const popupWidth = Math.max(Math.min(560, window.innerWidth * 0.4), 320);
    // Offset by LinkFloater's internal GAP (8px) so the popup sits flush against the footer.
    const rect = new DOMRect(shellRect.left, footerRect.top + 8, popupWidth, 0);
    state.inline.link.setAnchorRect(rect);
    state.inline.dismissed.next(true);
    state.inline.link.toggle();
  };

  return (
    <div
      ref={footerRef}
      className={footerClass}
      style={{color: infoColor, padding: width < 700 ? '0 16px' : void 0, borderTop: `1px solid ${styles.g(0, 0.06)}`}}
    >
      <div className={footerGroupClass}>
        {!!statusText && <Label>{statusText}</Label>}
        {!readOnly && (focused || linkOpen) && !!caretPath && showCaretPath && (
          <span className={statusPathClass}>
            <Breadcrumbs
              compact
              crumbs={caretPath.map((segment, index) => (
                <Breadcrumb
                  key={`${index}:${segment}`}
                  compact
                  onMouseDown={preventBreadcrumbMouseDown}
                  onClick={segment === 'link' ? handleLinkBreadcrumbClick : undefined}
                >
                  {typeToLabel(segment) || segment}
                </Breadcrumb>
              ))}
            />
            {!!footerUrl && showCaretUrl && (
              <>
                <span style={{opacity: 0.25}}>{'→'}</span>
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
                <CopyButton
                  type="button"
                  width={24}
                  height={24}
                  rounder
                  onMouseDown={(event) => event.preventDefault()}
                  onCopy={() => footerUrl}
                  tooltip={{nowrap: true, renderTooltip: () => 'Copy link'}}
                />
              </>
            )}
            {!!caretCodeText && showCaretCode && (
              <>
                <span style={{opacity: 0.25}}>{'→'}</span>
                <CopyCode value={caretCodeText} truncate style={{maxWidth: 220}} alt spacious roundest />
              </>
            )}
            {!!caretMathTex && showCaretCode && (
              <>
                <span style={{opacity: 0.25}}>{'→'}</span>
                <CopyCode value={caretMathTex} truncate style={{maxWidth: 220}} alt spacious roundest />
              </>
            )}
          </span>
        )}
      </div>

      <div className={footerGroupClass}>
        <TranslitFooterPill />
        {!!selectionSummary && showSelectionSummary && (
          <>
            <span>{selectionSummary}</span>
            <span style={{opacity: 0.25}}>{'•'}</span>
          </>
        )}
        <span>{pluralize(wordCount, 'word')}</span>
        {showCharacterCount && (
          <>
            <span style={{opacity: 0.25}}>{'•'}</span>
            <span>{pluralize(characterCount, 'character')}</span>
          </>
        )}
      </div>
    </div>
  );
};
