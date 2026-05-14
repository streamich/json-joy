import * as React from 'react';
import {rule} from 'nano-theme';
import {Transforms} from 'slate';
import {useFocused, useReadOnly, useSelected, useSlateStatic, ReactEditor, type RenderElementProps} from 'slate-react';
import {More as MoreIcon} from '@jsonjoy.com/ui/lib/icons/interactive/More';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useMuTxt} from '../../../context';
import {MathSpan} from '../../../void/math/mathlive';
import {StripBarHandle} from '../StripBarHandle';
import {VoidSelectionOverlay} from '../VoidSelectionOverlay';
import {MathOptionsPopup} from './MathOptionsPopup';
import * as settings from './settings';
import type {MathElement as MathElementType, MathThing} from '../../../types';
import type {MathfieldElement} from 'mathlive';
import {useT} from 'use-t';

const blockClass = rule({
  pos: 'relative',
  mr: '8px 0',
  bdrad: '6px',
  bxz: 'border-box',
});

const stripWrapClass = rule({
  mrt: '4px',
  mrb: '2px',
});

const equationWrapClass = rule({
  pos: 'relative',
  d: 'flex',
  fld: 'column',
  ai: 'center',
  jc: 'center',
  gap: '6px',
  bxz: 'border-box',
});

const fieldWrapClass = rule({
  pos: 'relative',
  d: 'flex',
  jc: 'center',
  ai: 'center',
  w: '100%',
  pd: 0,
  bdrad: '6px',
  bxz: 'border-box',
});

const captionClass = rule({
  textAlign: 'center',
  fz: '13px',
  lh: 1.4,
  us: 'none',
});

const placeholderClass = rule({
  fz: '13px',
  lh: 1.4,
  us: 'none',
});

const moreWrapClass = rule({
  pos: 'absolute',
  t: '-8px',
  insetInlineEnd: '8px',
  trs: 'opacity 0.15s ease',
  z: 1,
});

export interface MathElementProps extends RenderElementProps {
  element: MathElementType;
}

export const MathElement: React.FC<MathElementProps> = ({attributes, children, element}) => {
  const [t] = useT();
  const mutxt = useMuTxt();
  mutxt.things.version.use();
  const styles = useStyles();
  const readOnly = useReadOnly();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const selected = isSelected && isFocused;
  const editor = useSlateStatic();
  const [hovered, setHovered] = React.useState(false);

  const thingId = element['@thing'];
  const thing = thingId ? (mutxt.things.get(thingId) as MathThing | undefined) : undefined;
  const tex = thing?.val ?? '';
  const size = settings.getMathSize(element.size);

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<string>(tex);
  const fieldRef = React.useRef<MathfieldElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const skipBlurCommitRef = React.useRef(false);

  const enterEdit = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (readOnly) return;
      if (!thingId) return;
      setDraft(tex);
      setEditing(true);
    },
    [readOnly, tex, thingId],
  );

  React.useEffect(() => {
    if (!editing) return;
    const el = fieldRef.current as any;
    if (el && typeof el.value === 'string' && el.value !== draft) {
      el.value = draft;
    }
    const raf = requestAnimationFrame(() => {
      try {
        fieldRef.current?.focus?.();
      } catch {}
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const commitDraft = React.useCallback(
    (next: string): void => {
      if (!thingId) return;
      const trimmed = next.trim();
      const currentThing = mutxt.things.get(thingId) as MathThing | undefined;
      const currentTex = currentThing?.val ?? '';
      if (trimmed === currentTex) return;
      mutxt.things.update(thingId, {val: trimmed});
      mutxt.sync(false);
    },
    [mutxt, thingId],
  );

  // Slate-react attaches `beforeinput` and friends to the native DOM, so
  // synthetic React handlers on <math-field> would not fire (our wrapper
  // stops the native event before it reaches React's delegation root). Do
  // all interactive handling via native listeners on the field itself.
  React.useEffect(() => {
    if (!editing) return;
    const field = fieldRef.current as any;
    const wrapper = wrapperRef.current;
    if (!field || !wrapper) return;

    const focusStillInMath = (): boolean => {
      if (typeof field.hasFocus === 'function') {
        try {
          if (field.hasFocus()) return true;
        } catch {}
      }
      const ae = document.activeElement as Element | null;
      if (!ae) return false;
      if (ae === field) return true;
      if (ae.tagName === 'MATH-FIELD') return true;
      if (typeof ae.closest === 'function') {
        if (ae.closest('math-field')) return true;
        if (ae.closest('[class*="ML__"]')) return true;
      }
      return false;
    };

    const onFieldInput = () => {
      const next: string = field.value ?? '';
      setDraft(next);
    };

    const onFieldBlur = () => {
      if (skipBlurCommitRef.current) {
        skipBlurCommitRef.current = false;
        return;
      }
      setTimeout(() => {
        if (focusStillInMath()) return;
        const next: string = field.value ?? '';
        commitDraft(next);
        setEditing(false);
      }, 0);
    };

    const onFieldKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        skipBlurCommitRef.current = true;
        const next: string = field.value ?? '';
        commitDraft(next);
        setEditing(false);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        skipBlurCommitRef.current = true;
        setEditing(false);
      }
    };

    field.addEventListener('input', onFieldInput);
    field.addEventListener('blur', onFieldBlur);
    field.addEventListener('keydown', onFieldKeyDown);

    const stop = (event: Event) => event.stopPropagation();
    const bubblingEvents = [
      'beforeinput',
      'input',
      'keydown',
      'keyup',
      'keypress',
      'compositionstart',
      'compositionupdate',
      'compositionend',
      'copy',
      'cut',
      'paste',
      'drop',
      'dragstart',
    ];
    for (const ev of bubblingEvents) wrapper.addEventListener(ev, stop);

    return () => {
      field.removeEventListener('input', onFieldInput);
      field.removeEventListener('blur', onFieldBlur);
      field.removeEventListener('keydown', onFieldKeyDown);
      for (const ev of bubblingEvents) wrapper.removeEventListener(ev, stop);
    };
  }, [editing, commitDraft]);

  const stopReact = React.useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const selectBlock = React.useCallback(() => {
    try {
      const path = ReactEditor.findPath(editor, element);
      Transforms.select(editor, path);
      ReactEditor.focus(editor);
    } catch {}
  }, [editor, element]);

  const isDark = !styles.light;
  const fieldColor = styles.g(0.15);
  const fieldBg = isDark ? styles.g(1, 0.04) : styles.g(0, 0.04);
  const fieldBorder = isDark ? styles.g(1, 0.1) : styles.g(0, 0.08);
  const captionColor = styles.g(0.42);

  const padding = settings.MATH_SIZE_PADDING[size];
  const spanMode = settings.mathSizeToSpanMode(size);
  const fieldDefaultMode = settings.mathSizeToFieldDefaultMode(size);
  const sizeFontSize = settings.MATH_SIZE_FONT[size];
  const stylePrefix = settings.mathSizeToLatexStylePrefix(size);
  const displayedTex = stylePrefix && tex ? stylePrefix + tex : tex;

  const showToolbar = !readOnly && (selected || hovered) && !editing;
  const showStrip = !readOnly && (hovered || selected) && !editing;

  return (
    <div
      {...attributes}
      className={blockClass}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div contentEditable={false}>
        <div className={stripWrapClass}>
          <StripBarHandle
            ariaLabel={t('Select equation')}
            onActivate={() => selectBlock()}
            visible={showStrip}
            width="11%"
            color={isDark ? styles.g(1, 0.32) : styles.g(0, 0.22)}
            colorHover={isDark ? styles.g(1, 0.55) : styles.g(0, 0.45)}
          />
        </div>

        <Paper
          noOutline
          style={{
            margin: '4px 0',
            position: 'relative',
            background: selected && !editing ? styles.g(0, 0.05) : 'transparent',
          }}
        >
          <div
            className={equationWrapClass}
            onClick={editing ? undefined : enterEdit}
            style={{padding, cursor: editing ? 'text' : 'default', fontSize: sizeFontSize}}
          >
            {editing ? (
              <div
                ref={wrapperRef}
                className={fieldWrapClass}
                style={{
                  background: fieldBg,
                  border: `1px solid ${fieldBorder}`,
                  colorScheme: isDark ? 'dark' : 'light',
                }}
                onMouseDown={stopReact}
                onClick={stopReact}
              >
                {React.createElement('math-field', {
                  ref: fieldRef as any,
                  'default-mode': fieldDefaultMode,
                  style: {
                    maxWidth: '100%',
                    minWidth: '120px',
                    boxSizing: 'border-box',
                    padding: 0,
                    color: fieldColor,
                    background: 'transparent',
                    ['--primary' as any]: fieldColor,
                    ['--text-font-family' as any]: 'inherit',
                    ['--caret-color' as any]: fieldColor,
                    ['--keycap-background' as any]: styles.g(1, 0.08),
                    ['--keycap-background-hover' as any]: styles.g(1, 0.16),
                    ['--keycap-text' as any]: fieldColor,
                    ['--keyboard-background' as any]: styles.g(1, 0.04),
                    ['--keyboard-text' as any]: fieldColor,
                    ['--smart-fence-color' as any]: fieldColor,
                  },
                })}
              </div>
            ) : tex ? (
              <MathSpan tex={displayedTex} mode={spanMode} selected={selected} focused={selected} dark={isDark} />
            ) : (
              <div className={placeholderClass} style={{color: styles.g(0.5)}}>
                {t('Click to enter equation')}
              </div>
            )}
            {element.caption ? (
              <div className={captionClass} style={{color: captionColor}}>
                {element.caption}
              </div>
            ) : null}
            {!editing && <VoidSelectionOverlay selected={selected} />}
          </div>
        </Paper>
      </div>
      {!readOnly && (
        <div
          contentEditable={false}
          className={moreWrapClass}
          onMouseDown={preventMouseDown}
          style={{opacity: showToolbar ? 1 : 0, pointerEvents: showToolbar ? 'auto' : 'none'}}
        >
          <Popup renderContext={() => <MathOptionsPopup element={element} />}>
            <BasicButton type="button" width={32} height={32} rounder border onMouseDown={preventMouseDown}>
              <MoreIcon size={32} />
            </BasicButton>
          </Popup>
        </div>
      )}
      {children}
    </div>
  );
};
