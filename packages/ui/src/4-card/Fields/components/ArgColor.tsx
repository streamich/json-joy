import * as React from 'react';
import {ColorPreview} from '../../../1-inline/ColorPreview';
import {Input} from '../../../2-inline-block/Input';
import type {InputColorProps} from '../../../2-inline-block/InputColor';
import {useLockScrolling} from '../../../hooks/useLockScrolling';
import {useSingletonPopup} from '../../../hooks/useSingletonPopup';
import type {HslColor} from '../../../styles/color/HslColor';
import {RgbColor} from '../../../styles/color/RgbColor';
import {anchorContext, useAnchorPointHandle} from '../../../utils/popup';
import {ColorPickerInput} from '../../ColorPicker/ColorPickerInput';
import {ContextPane} from '../../ContextMenu/ContextPane';
import {context as popupCtx} from '../../Popup/context';
import {PopupControlled} from '../../Popup/PopupControlled';
import type {ParamColor} from '../../StructuralMenu/types';
import {DefaultableToggle} from './DefaultableToggle';

export interface DefaultableColorValue {
  def: boolean;
  value: string;
}

export interface ArgColorProps extends Omit<InputColorProps, 'value' | 'onChange'> {
  param: ParamColor;
  value: string | DefaultableColorValue;
  onChange?: (value: string | DefaultableColorValue) => void;
}

// Outer swatch size in px (border-box, includes the 2px ring) — matches the
// previous 22px fill plus a 2px border on each side.
const SWATCH_SIZE = 26;

const normalizeColor = (s: string, allowAlpha: boolean): string | null => {
  const rgb = RgbColor.fromString(s.trim());
  if (!rgb) return null;
  if (!allowAlpha && rgb.a !== 1) return null;
  return rgb.hex();
};

const readStructured = (v: unknown, fallback: string): DefaultableColorValue => {
  if (v && typeof v === 'object' && 'def' in v) {
    const s = v as DefaultableColorValue;
    return {def: !!s.def, value: String(s.value ?? fallback)};
  }
  return {def: false, value: typeof v === 'string' && v ? v : fallback};
};

/** Value semantics and actions shared by {@link ArgColor} and `ArgColorReveal`. */
export const colorArg = (param: ParamColor, value: ArgColorProps['value'], onChange: ArgColorProps['onChange']) => {
  const alphaEnabled = !!param.alpha;
  const defaultable = !!param.defaultable;
  const fallback = (param.default as string | undefined) || '#000000';
  const s = readStructured(value, fallback);
  const def = defaultable && s.def;
  const emit = (next: DefaultableColorValue) => {
    if (defaultable) onChange?.(next);
    else onChange?.(next.value);
  };
  return {
    alphaEnabled,
    defaultable,
    fallback,
    s,
    def,
    /** Effective displayed color (falls back to the default in auto mode). */
    current: def ? fallback : s.value || fallback,
    setColor: (v: string) => emit({def: false, value: v}),
    enterCustom: () => emit({def: false, value: s.value}),
    revertToAuto: () => emit({def: true, value: s.value}),
  };
};

/** Value-only color control (hex input + swatch + picker popup). The definition cell is rendered by `FieldRow`. */
export const ArgColor: React.FC<ArgColorProps> = ({param, value, onChange}) => {
  const [autoHover, setAutoHover] = React.useState(false);

  const {alphaEnabled, defaultable, def, current, setColor, enterCustom, revertToAuto} = colorArg(
    param,
    value,
    onChange,
  );

  const [preview, setPreview] = React.useState<string>(current);
  const [text, setText] = React.useState<string>(current);
  React.useEffect(() => {
    setPreview(current);
    setText(current);
  }, [current]);

  const onTextChange = (v: string) => {
    setText(v);
    const norm = normalizeColor(v, alphaEnabled);
    if (norm) setPreview(norm);
  };

  const commitText = () => {
    const norm = normalizeColor(text, alphaEnabled);
    if (norm && norm !== current) setColor(norm);
  };

  const swatchBox = (active: boolean) => (
    <ColorPreview
      color={active ? preview : current}
      size={SWATCH_SIZE}
      checkerboard={alphaEnabled}
      role="button"
      tabIndex={0}
      aria-haspopup={active ? 'dialog' : undefined}
      aria-expanded={active ? popup.open : undefined}
      style={{
        opacity: active ? 1 : autoHover ? 1 : 0.5,
        transition: 'opacity .12s, box-shadow .12s',
      }}
      onMouseEnter={active ? undefined : () => setAutoHover(true)}
      onMouseLeave={active ? undefined : () => setAutoHover(false)}
      onClick={active ? undefined : enterCustom}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          if (active) popup.setOpen(!popup.open);
          else enterCustom();
        }
      }}
    />
  );

  const pickerDraggingRef = React.useRef(false);
  const pendingValueRef = React.useRef<string | null>(null);
  const setColorRef = React.useRef(setColor);
  setColorRef.current = setColor;
  const currentRef = React.useRef(current);
  currentRef.current = current;
  React.useEffect(() => {
    const onUp = () => {
      if (!pickerDraggingRef.current) return;
      pickerDraggingRef.current = false;
      const pending = pendingValueRef.current;
      pendingValueRef.current = null;
      if (pending && pending !== currentRef.current) setColorRef.current(pending);
    };
    document.addEventListener('pointerup', onUp);
    return () => document.removeEventListener('pointerup', onUp);
  }, []);

  const formatColor = (hsl: HslColor): string => hsl.toRgb().hex();

  const popup = useSingletonPopup('arg-color');
  const closePopup = React.useCallback(() => popup.setOpen(false), [popup]);
  const popupContextValue = React.useMemo(() => ({close: closePopup}), [closePopup]);
  const anchorHandle = useAnchorPointHandle();
  useLockScrolling(popup.open);

  const dropRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!popup.open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const tog = anchorHandle.toggle;
      const drop = dropRef.current;
      if (tog && tog.contains(target)) return;
      if (drop && drop.contains(target)) return;
      closePopup();
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [popup.open, anchorHandle, closePopup]);

  const renderPicker = () => (
    <div ref={dropRef}>
      <ContextPane
        style={{padding: 12}}
        onPointerDown={() => {
          pickerDraggingRef.current = true;
        }}
      >
        <ColorPickerInput
          noAlpha={!alphaEnabled}
          color={preview}
          onChange={(hsl: HslColor) => {
            const css = formatColor(hsl);
            setPreview(css);
            pendingValueRef.current = css;
          }}
        />
      </ContextPane>
    </div>
  );

  const activeSwatch = (
    <popupCtx.Provider value={popupContextValue}>
      <anchorContext.Provider value={anchorHandle}>
        <PopupControlled
          open={popup.open}
          refToggle={anchorHandle.ref}
          onHeadClick={() => popup.setOpen(!popup.open)}
          onClickAway={closePopup}
          onEsc={popup.open ? closePopup : undefined}
          renderContext={renderPicker}
        >
          {swatchBox(true)}
        </PopupControlled>
      </anchorContext.Provider>
    </popupCtx.Provider>
  );

  const customControl = (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
      <span style={{width: 84}}>
        <Input
          size={-3}
          mono
          type="text"
          value={text}
          placeholder={alphaEnabled ? '#RRGGBBAA' : '#RRGGBB'}
          onChange={onTextChange}
          onBlur={commitText}
          onEnter={commitText}
        />
      </span>
      {activeSwatch}
    </span>
  );

  const autoDisplay = swatchBox(false);
  const right = defaultable ? (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, margin: '-8px 0'}}>
      {def ? (
        <>
          <DefaultableToggle def onClick={enterCustom} />
          {autoDisplay}
        </>
      ) : (
        <>
          <DefaultableToggle def={false} onClick={revertToAuto} />
          {customControl}
        </>
      )}
    </span>
  ) : (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, margin: '-8px 0'}}>{customControl}</span>
  );

  return right;
};
