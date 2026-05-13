import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {ContextPane} from '../../ContextPane';
import {Input} from '../../../../2-inline-block/Input';
import {PopupControlled} from '../../../Popup/PopupControlled';
import {context as popupCtx} from '../../../Popup/context';
import {anchorContext, useAnchorPointHandle} from '../../../../utils/popup';
import {useLockScrolling} from '../../../../hooks/useLockScrolling';
import {useSingletonPopup} from '../../../../hooks/useSingletonPopup';
import {ColorPickerInput} from '../../../ColorPicker/ColorPickerInput';
import {useStyles} from '../../../../styles/context';
import {HslColor} from '../../../../styles/color/HslColor';
import {RgbColor} from '../../../../styles/color/RgbColor';
import {OptionalBadge} from './OptionalBadge';
import {DefaultableToggle} from './DefaultableToggle';
import type {ArgColorProps, DefaultableColorValue} from './ArgColor';

const SWATCH_SIZE = 22;

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

// 6×6 transparency checkerboard for swatches that may show alpha.
const checkerStyle: React.CSSProperties = {
  background:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), ' +
    'linear-gradient(-45deg, #ccc 25%, transparent 25%), ' +
    'linear-gradient(45deg, transparent 75%, #ccc 75%), ' +
    'linear-gradient(-45deg, transparent 75%, #ccc 75%), #fff',
  backgroundSize: '6px 6px',
  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0',
};

export const ArgColorCompact: React.FC<ArgColorProps> = ({param, value, onChange}) => {
  const [t] = useT();
  const styles = useStyles();
  const [autoHover, setAutoHover] = React.useState(false);
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');

  const alphaEnabled = !!param.alpha;
  const defaultable = !!param.defaultable;
  const fallback = ((param.default as string | undefined) || '#000000');
  const s = readStructured(value, fallback);
  const def = defaultable && s.def;
  const current = def ? fallback : (s.value || fallback);

  const [preview, setPreview] = React.useState<string>(current);
  const [text, setText] = React.useState<string>(current);
  React.useEffect(() => {
    setPreview(current);
    setText(current);
  }, [current]);

  const emit = (next: DefaultableColorValue) => {
    if (defaultable) onChange?.(next);
    else onChange?.(next.value);
  };
  const setColor = (v: string) => emit({def: false, value: v});
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

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
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: SWATCH_SIZE,
        height: SWATCH_SIZE,
        border: `2px solid ${styles.g(0.99, 0.9)}`,
        borderRadius: 4,
        boxShadow: '0px 1px 2px rgba(0,0,0,.2)',
        overflow: 'hidden',
        flexShrink: 0,
        opacity: active ? 1 : autoHover ? 1 : 0.5,
        transition: 'opacity .12s, box-shadow .12s',
        ...(alphaEnabled ? checkerStyle : {}),
      }}
      onMouseEnter={active ? undefined : () => setAutoHover(true)}
      onMouseLeave={active ? undefined : () => setAutoHover(false)}
      onClick={active ? undefined : enterCustom}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: active ? preview : current,
        }}
      />
    </span>
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
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, margin: '-8px -4px -8px 0'}}>
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
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, margin: '-8px -4px -8px 0'}}>
      {customControl}
    </span>
  );

  return (
    <ContextItem icon={param.icon?.()} control inset right={right}>
      <span>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
