import React from 'react';
import Alpha from '@uiw/react-color-alpha';
import Saturation from '@uiw/react-color-saturation';
import Hue from '@uiw/react-color-hue';
import {useStyles} from '../../styles/context';
import {Space} from '../../3-list-item/Space';
import {HslColor} from '../../styles/color/HslColor';
import {HsvColor} from '../../styles/color/HsvColor';

interface HsvaColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'color'> {
  prefixCls?: string;
  onChange?: (color: HslColor) => void;
  color?: string | HslColor;
  noAlpha?: boolean;
}

const Pointer = ({
  style,
  color,
  borderColor,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {color: string; borderColor: string}) => {
  const stylePointer: React.CSSProperties = {
    height: 20,
    width: 20,
    position: 'absolute',
    transform: 'translate(-12px, -12px)',
    boxShadow: '0 2px 4px rgb(0 0 0 / 20%)',
    borderRadius: '50%',
    border: `2px solid ${borderColor}`,
    zIndex: 1,
    ...style,
  } as React.CSSProperties;
  return (
    <div {...props} style={stylePointer}>
      <div
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          height: '100%',
          width: '100%',
        }}
      />
    </div>
  );
};

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>((props, ref) => {
  const {prefixCls = 'jsonjoy-color-picker', className, onChange, color, style, noAlpha, ...other} = props;
  const styles = useStyles();
  const pointerBorder = styles.bg + '';
  const checkerboardBg = styles.light ? '#fff' : styles.g(0.78);
  const saturationBottomBorder = styles.light ? '#000' : styles.g(0.92);
  const hsl = HslColor.from(color ?? '') ?? new HslColor(0, 0, 0);
  const hsv = hsl.toHsv();
  const hsva = {h: hsv.h * 360, s: hsv.s * 100, v: hsv.v * 100, a: hsv.a};
  return (
    <div
      ref={ref}
      style={{
        width: 200,
        position: 'relative',
        ...style,
      }}
      {...other}
      className={`${prefixCls} ${className || ''}`}
    >
      <Saturation
        hsva={hsva}
        className={prefixCls}
        radius="8px"
        style={{width: 'auto', height: 150, minWidth: 120, borderBottom: `12px solid ${saturationBottomBorder}`}}
        pointer={({left, top}) => <Pointer style={{left, top}} color={hsl.toString()} borderColor={pointerBorder} />}
        onChange={({h, s, v, a}: HsvaColor) => {
          const hsv = new HsvColor(h / 360, s / 100, v / 100, a);
          const hsl = HslColor.from(hsv)!;
          onChange?.(hsl);
        }}
      />
      <Space />
      <Hue
        hue={hsva.h}
        height={24}
        radius="8px"
        className={prefixCls}
        onChange={({h}) => {
          const copy = hsl.copy();
          copy.h = h / 360;
          onChange?.(copy);
        }}
        pointer={({left}) => (
          <Pointer style={{left}} color={`hsl(${hsva.h || 0}deg 100% 50%)`} borderColor={pointerBorder} />
        )}
      />
      {!noAlpha && (
        <>
          <Space />
          <Alpha
            hsva={hsva}
            height={24}
            className={prefixCls}
            radius="8px"
            style={{['--alpha-background-color' as any]: checkerboardBg}}
            pointer={({left}) => <Pointer style={{left}} color={hsl.toString()} borderColor={pointerBorder} />}
            onChange={(newAlpha) => {
              const newHsl = hsl.copy();
              newHsl.a = newAlpha.a;
              onChange?.(newHsl);
            }}
          />
        </>
      )}
    </div>
  );
});
