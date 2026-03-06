import React from 'react';
import {
  validHex,
  color as handleColor,
  hexToHsva,
  type HsvaColor,
  type ColorResult,
  hsvaToHex,
  hsvaToRgbaString,
} from '@uiw/color-convert';
import Alpha, { BACKGROUND_IMG } from '@uiw/react-color-alpha';
import Saturation from '@uiw/react-color-saturation';
import Hue from '@uiw/react-color-hue';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';

export interface ColorfulProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'color'> {
  prefixCls?: string;
  onChange?: (color: ColorResult) => void;
  color?: string | HsvaColor;
  disableAlpha?: boolean;
}

const Pointer = ({ style, color, ...props }: React.HTMLAttributes<HTMLDivElement> & { color: string }) => {
  const stylePointer: React.CSSProperties = {
    height: 20,
    width: 20,
    position: 'absolute',
    transform: 'translate(-12px, -12px)',
    boxShadow: '0 2px 4px rgb(0 0 0 / 20%)',
    borderRadius: '50%',
    border: '2px solid #fff',
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

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorfulProps>((props, ref) => {
  const { prefixCls = 'jsonjoy-color-picker', className, onChange, color, style, disableAlpha, ...other } = props;
  const hsva = (typeof color === 'string' && validHex(color) ? hexToHsva(color) : color || {}) as HsvaColor;
  const handleChange = (value: HsvaColor) => onChange && onChange(handleColor(value));
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
        style={{ width: 'auto', height: 150, minWidth: 120, borderBottom: '12px solid #000' }}
        pointer={({ left, top, color }) => <Pointer style={{ left, top }} color={color ?? hsvaToHex(hsva)} />}
        onChange={(newColor) => handleChange({ ...hsva, ...newColor })}
      />
      <Space />
      <Hue
        hue={hsva.h}
        height={24}
        radius="8px"
        className={prefixCls}
        onChange={(newHue) => handleChange({ ...hsva, ...newHue })}
        pointer={({ left }) => (
          <Pointer style={{ left }} color={`hsl(${hsva.h || 0}deg 100% 50%)`} />
        )}
      />
      {!disableAlpha && (
        <>
          <Space />
          <Alpha
            hsva={hsva}
            height={24}
            className={prefixCls}
            radius="8px"
            pointer={({ left }) => <Pointer style={{ left }} color={hsvaToRgbaString(hsva)} />}
            onChange={(newAlpha) => handleChange({ ...hsva, ...newAlpha })}
          />
        </>
      )}
    </div>
  );
});
