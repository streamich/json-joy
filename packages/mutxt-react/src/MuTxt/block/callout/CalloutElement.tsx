import * as React from 'react';
import {rule, font} from 'nano-theme';
import {ReactEditor, useReadOnly, useSlateStatic, type RenderElementProps} from 'slate-react';
import {Transforms} from 'slate';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {Scrollbox} from '@jsonjoy.com/ui/lib/4-card/Scrollbox';
import {context as popupCtx} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup';
import {useLockScrolling} from '@jsonjoy.com/ui/lib/hooks/useLockScrolling';
import {useSingletonPopup} from '@jsonjoy.com/ui/lib/hooks/useSingletonPopup';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {FlexibleInput} from 'flexible-input';
import {useT} from 'use-t';
import {BlockPlaceholder} from '../../components/blocks/BlockPlaceholder';
import {
  StripBarHandle,
  stripBarHandleFillClass,
  stripBarHandleTriggerClass,
} from '../../components/blocks/StripBarHandle';
import {indentPadding} from '../../behavior/indentation';
import {fontFamilyOf} from '../../behavior/font';
import {fgVar} from '../../custom-style/css';
import {isEmptyBlock} from '../../util';
import {CalloutOptions} from './CalloutOptions';
import {getCalloutColors} from './colors';
import {VARIANT_ICONS, VARIANT_TITLE, getCalloutVariant, getVariantAccent} from './settings';
import type {CalloutElement as CalloutElementType} from '../../types';

const INDICATOR_SIZE = 28;

const calloutClass = rule({
  pos: 'relative',
  mr: '24px 0',
  pd: '16px',
  bdrad: '8px',
  d: 'flex',
  fld: 'column',
  gap: '6px',
  bg: 'var(--cb-bg)',
  bd: '1px solid var(--cb-bd)',
  trs: 'background-color .2s ease, border-color .2s ease',
  '&:hover': {
    bg: 'var(--cb-bg-hover)',
    borderColor: 'var(--cb-bd-hover)',
  },
  [`&:hover .${stripBarHandleTriggerClass}`]: {
    opacity: 1,
    pointerEvents: 'auto',
  },
  [`&:hover .${stripBarHandleTriggerClass} .${stripBarHandleFillClass}`]: {
    width: '100%',
  },
});

const handleClass = rule({
  pos: 'absolute',
  insetInlineStart: '-3px',
  t: '8px',
  b: '8px',
  w: '5px',
  bdrad: '2px',
  pe: 'none',
});

const handleButtonClass = rule({
  pos: 'absolute',
  insetInlineStart: '-3px',
  t: '8px',
  b: '8px',
  w: '5px',
  bdrad: '2px',
  pad: 0,
  bd: 'none',
  cur: 'pointer',
  out: 'none',
  trs: 'width .1s ease, inset-inline-start .1s ease, transform .1s ease',
  '&:hover': {
    w: '7px',
    insetInlineStart: '-4px',
  },
  '&:active': {
    transform: 'scaleY(0.97)',
  },
});

const handleButtonContentClass = rule({
  d: 'block',
  w: '5px',
  h: '100%',
  pad: 0,
  bd: 'none',
  bdrad: '2px',
  cur: 'pointer',
  out: 'none',
  trs: 'width .1s ease, transform .1s ease',
  '&:hover': {w: '7px'},
  '&:active': {transform: 'scaleY(0.97)'},
});

const headerClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '8px',
  us: 'none',
  minH: `${INDICATOR_SIZE}px`,
});

const indicatorTriggerClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: `${INDICATOR_SIZE}px`,
  h: `${INDICATOR_SIZE}px`,
  bdrad: '6px',
  pad: 0,
  bd: 'none',
  bg: 'transparent',
  cur: 'pointer',
  lh: 1,
  flexShrink: 0,
  trs: 'background-color .08s ease, transform .08s ease',
  '&:hover': {
    transform: 'scale(1.03)',
  },
  '&:active': {
    transform: 'scale(0.97)',
  },
});

const indicatorGlyphClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  lh: 1,
});

const indicatorTextClass = rule({
  ...font.slab.bold,
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  fz: '0.95rem',
  lh: 1,
  ['textBoxTrim' as any]: 'trim-both',
  ['textBoxEdge' as any]: 'cap alphabetic',
});

const indicatorEmojiClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  fz: '1.2rem',
  lh: 1,
});

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const isEmoji = (s: string): boolean => EMOJI_RE.test(s);

const titleClass = rule({
  ...font.ui3.mid,
  textTransform: '',
  d: 'inline-flex',
  ai: 'center',
  h: '100%',
  fz: '0.95rem',
  lh: 1.3,
  flex: '1',
  minW: '0',
  ['textBoxTrim' as any]: 'trim-both',
  ['textBoxEdge' as any]: 'cap alphabetic',
  marginInlineStart: '-4px',
});

const titleStripSlotClass = rule({
  d: 'inline-flex',
  ai: 'center',
  flex: '1',
  minW: 0,
  marginInlineStart: '-4px',
});

const bodyClass = rule({
  pos: 'relative',
  m: '0',
  fz: '0.98em',
  lh: 1.6,
});

const bindVoidInputKeyDown = (el: HTMLElement | null, editor: ReactEditor, onCancel?: () => void): (() => void) => {
  if (!el) return () => {};
  const handler: EventListener = (evt: Event) => {
    const e = evt as KeyboardEvent;
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
      requestAnimationFrame(() => ReactEditor.focus(editor));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
      (e.target as HTMLElement).blur();
      requestAnimationFrame(() => ReactEditor.focus(editor));
    }
  };
  el.addEventListener('keydown', handler);
  return () => el.removeEventListener('keydown', handler);
};

export interface CalloutElementProps extends RenderElementProps {
  element: CalloutElementType;
}

export const CalloutElement: React.FC<CalloutElementProps> = ({attributes, children, element}) => {
  const editor = useSlateStatic();
  const styles = useStyles();
  const readOnly = useReadOnly();
  const [t] = useT();
  const variant = getCalloutVariant(element.variant);
  const accent = element.color?.trim() || getVariantAccent(styles, variant);
  const icon = element.icon ?? '';
  const variantTitle = VARIANT_TITLE[variant];
  const titleOverride = element.title;
  const resolvedTitle = titleOverride ?? variantTitle;
  const colors = React.useMemo(() => getCalloutColors(styles, accent), [styles, accent]);
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(resolvedTitle);
  const titleFocusedRef = React.useRef(false);
  React.useEffect(() => {
    if (!titleFocusedRef.current) setTitleDraft(resolvedTitle);
  }, [resolvedTitle]);

  const commitTitle = React.useCallback(() => {
    titleFocusedRef.current = false;
    const next = titleDraft;
    try {
      const path = ReactEditor.findPath(editor, element);
      if (!next) {
        // Empty: unset if there was an override (back to auto); no-op if
        // already auto.
        if (titleOverride !== undefined) Transforms.unsetNodes(editor, 'title', {at: path});
      } else if (next === variantTitle) {
        // Typing the variant default is equivalent to "use the default" —
        // unset to keep storage clean, regardless of prior state.
        if (titleOverride !== undefined) Transforms.unsetNodes(editor, 'title', {at: path});
      } else {
        Transforms.setNodes(editor, {title: next} as Partial<CalloutElementType>, {at: path});
      }
    } catch {}
    if (!next) setEditingTitle(false);
  }, [editor, element, titleDraft, titleOverride, variantTitle]);

  const [titleInputEl, setTitleInputEl] = React.useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  React.useEffect(() => {
    if (readOnly) return;
    return bindVoidInputKeyDown(titleInputEl, editor as ReactEditor, () => {
      setTitleDraft(resolvedTitle);
      titleFocusedRef.current = false;
      if (!resolvedTitle) setEditingTitle(false);
    });
  }, [titleInputEl, readOnly, resolvedTitle, editor]);

  // Options popup.
  const popup = useSingletonPopup('callout-options');
  const closePopup = React.useCallback(() => popup.setOpen(false), [popup]);
  const popupContextValue = React.useMemo(() => ({close: closePopup}), [closePopup]);
  const popupAnchorHandle = useAnchorPointHandle({
    horizontal: true,
    center: true,
    pinX: 'left',
    minSpace: 360,
    gap: 8,
  });
  useLockScrolling(popup.open);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const VariantIcon = VARIANT_ICONS[variant];
  const triggerBg = colors.bg;
  const triggerBgHover = styles.light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)';
  const hideHeader = !!element.hideHeader;

  const hasIconOverride = element.icon !== undefined;
  const iconIsEmoji = hasIconOverride && !!icon && isEmoji(icon);
  const indicator = !hasIconOverride ? (
    <span className={indicatorGlyphClass} style={{color: colors.title}}>
      <VariantIcon style={{color: colors.title}} />
    </span>
  ) : icon ? (
    <span className={iconIsEmoji ? indicatorEmojiClass : indicatorTextClass} style={{color: colors.title}}>
      {icon}
    </span>
  ) : null;

  const isExplicitBlank = titleOverride === '';
  const showTitleStrip = !readOnly && isExplicitBlank && !editingTitle;
  const showTitleField = !isExplicitBlank || editingTitle;

  return (
    <aside
      {...attributes}
      className={calloutClass}
      style={{
        textAlign: element.align,
        marginInlineStart: indentPadding(element.indent) ?? 0,
        marginInlineEnd: 0,
        fontFamily: fontFamilyOf(element.font),
        color: fgVar(18, styles.g(0.18)),
        boxShadow: `0 1px 4px ${colors.shadow}`,
        ['--cb-bg' as any]: colors.bg,
        ['--cb-bg-hover' as any]: colors.bgHover,
        ['--cb-bd' as any]: colors.bd,
        ['--cb-bd-hover' as any]: colors.bdHover,
        ['--mutxt-handle-color' as any]: styles.g(0.72),
        ['--mutxt-handle-color-hover' as any]: styles.g(0.35),
      }}
    >
      {readOnly ? (
        <span aria-hidden="true" contentEditable={false} className={handleClass} style={{background: colors.accent}} />
      ) : hideHeader ? (
        // Header is gone — the handle is the *only* affordance, so it
        // anchors the popup itself. PopupControlled's outer span carries the
        // absolute positioning; the inner button fills it.
        <popupCtx.Provider value={popupContextValue}>
          <anchorContext.Provider value={popupAnchorHandle}>
            <PopupControlled
              open={popup.open}
              refToggle={popupAnchorHandle.ref}
              onHeadClick={() => popup.setOpen(!popup.open)}
              onClickAway={closePopup}
              onEsc={popup.open ? closePopup : undefined}
              style={{
                position: 'absolute',
                insetInlineStart: '-3px',
                top: '8px',
                bottom: '8px',
              }}
              renderContext={() => (
                <MoveToViewport vertical>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: 'calc(100vh - 16px)',
                    }}
                  >
                    <Scrollbox shadow>
                      <div style={{padding: 16}}>
                        <CalloutOptions element={element} />
                      </div>
                    </Scrollbox>
                  </div>
                </MoveToViewport>
              )}
            >
              <button
                type="button"
                contentEditable={false}
                className={handleButtonContentClass}
                aria-label={t('Callout options')}
                aria-haspopup="dialog"
                aria-expanded={popup.open}
                onMouseDown={preventMouseDown}
                style={{background: colors.accent}}
              />
            </PopupControlled>
          </anchorContext.Provider>
        </popupCtx.Provider>
      ) : (
        // Header is visible — the icon trigger is the popup anchor; the
        // handle is a secondary trigger that toggles the same singleton
        // popup.
        <button
          type="button"
          contentEditable={false}
          className={handleButtonClass}
          aria-label={t('Callout options')}
          aria-haspopup="dialog"
          aria-expanded={popup.open}
          onMouseDown={preventMouseDown}
          onClick={() => popup.setOpen(!popup.open)}
          style={{background: colors.accent}}
        />
      )}
      {!hideHeader && (
        <div contentEditable={false} className={headerClass}>
          {readOnly ? (
            <span className={indicatorTriggerClass} style={{background: triggerBg}}>
              {indicator}
            </span>
          ) : (
            <popupCtx.Provider value={popupContextValue}>
              <anchorContext.Provider value={popupAnchorHandle}>
                <PopupControlled
                  open={popup.open}
                  refToggle={popupAnchorHandle.ref}
                  onHeadClick={() => popup.setOpen(!popup.open)}
                  onClickAway={closePopup}
                  onEsc={popup.open ? closePopup : undefined}
                  renderContext={() => (
                    <MoveToViewport vertical>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          maxHeight: 'calc(100vh - 16px)',
                        }}
                      >
                        <Scrollbox shadow>
                          <div style={{padding: 16}}>
                            <CalloutOptions element={element} />
                          </div>
                        </Scrollbox>
                      </div>
                    </MoveToViewport>
                  )}
                >
                  <button
                    type="button"
                    className={indicatorTriggerClass}
                    aria-label={t('Callout options')}
                    aria-haspopup="dialog"
                    aria-expanded={popup.open}
                    onMouseDown={preventMouseDown}
                    style={{background: triggerBg}}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = triggerBgHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = triggerBg;
                    }}
                  >
                    {indicator}
                  </button>
                </PopupControlled>
              </anchorContext.Provider>
            </popupCtx.Provider>
          )}
          {showTitleField ? (
            <span className={titleClass} style={{color: colors.title}}>
              {readOnly ? (
                resolvedTitle
              ) : (
                <FlexibleInput
                  inp={setTitleInputEl}
                  value={titleDraft}
                  minWidth={80}
                  focus={editingTitle && !titleDraft}
                  typeahead={titleDraft ? '' : t('Add title…')}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onFocus={() => {
                    titleFocusedRef.current = true;
                  }}
                  onBlur={commitTitle}
                />
              )}
            </span>
          ) : showTitleStrip ? (
            <span className={titleStripSlotClass}>
              <StripBarHandle
                tooltip={t('Add title')}
                ariaLabel={t('Add title')}
                onActivate={() => setEditingTitle(true)}
              />
            </span>
          ) : null}
        </div>
      )}
      <div className={bodyClass}>
        {children}
        {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
      </div>
    </aside>
  );
};
