import * as React from 'react';
import type {HslColor} from '../../../styles/color/HslColor';
import {ColorPickerInput} from '../../ColorPicker/ColorPickerInput';
import type {ParamColor} from '../../StructuralMenu/types';
import {ValueCell} from '../ValueCell';
import {colorArg} from './ArgColor';

export interface ArgColorRevealProps {
  param: ParamColor;
  value: unknown;
  onChange: (value: unknown) => void;
  align?: 'left' | 'right';
  /** Whether the cell fills the row width (card/block) or hugs its content. @default true */
  stretch?: boolean;
}

/**
 * Full-picker popover body. Previews live while dragging and commits on
 * pointer release (and on close, for values typed into the hex input) so a
 * drag scrub doesn't emit an `onChange` per frame — mirroring {@link ArgColor}'s
 * own swatch picker.
 */
const RevealPicker: React.FC<{param: ParamColor; value: unknown; onChange: (value: unknown) => void}> = ({
  param,
  value,
  onChange,
}) => {
  const {alphaEnabled, current, setColor} = colorArg(param, value as never, onChange as never);
  const [preview, setPreview] = React.useState<string>(current);
  React.useEffect(() => setPreview(current), [current]);

  const draggingRef = React.useRef(false);
  const pendingRef = React.useRef<string | null>(null);
  const setColorRef = React.useRef(setColor);
  setColorRef.current = setColor;
  const currentRef = React.useRef(current);
  currentRef.current = current;

  const commitPending = React.useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending && pending !== currentRef.current) setColorRef.current(pending);
  }, []);

  React.useEffect(() => {
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      commitPending();
    };
    document.addEventListener('pointerup', onUp);
    // Commit a value typed into the hex input (no pointer drag) when the
    // popover closes and this body unmounts.
    return () => {
      document.removeEventListener('pointerup', onUp);
      commitPending();
    };
  }, [commitPending]);

  return (
    <div
      style={{padding: '0 12px'}}
      onPointerDown={() => {
        draggingRef.current = true;
      }}
    >
      <ColorPickerInput
        noAlpha={!alphaEnabled}
        color={preview}
        onChange={(hsl: HslColor) => {
          const hex = hsl.toRgb().hex();
          setPreview(hex);
          pendingRef.current = hex;
        }}
      />
    </div>
  );
};

/**
 * The `reveal` edit-mode presentation of a color field. Reuses {@link ValueCell}
 * for the resting swatch + hex chip and all its popover machinery (anchoring,
 * width-matching, dismissal), but swaps the popover body from the compact
 * `ArgColor` control to the full {@link ColorPickerInput}.
 */
export const ArgColorReveal: React.FC<ArgColorRevealProps> = ({
  param,
  value,
  onChange,
  align = 'left',
  stretch = true,
}) => (
  <ValueCell
    param={param}
    value={value}
    onChange={onChange}
    align={align}
    stretch={stretch}
    renderPopover={(ctx) => <RevealPicker param={param} value={ctx.value} onChange={ctx.onChange} />}
  />
);
