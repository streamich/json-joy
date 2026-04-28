import * as React from 'react';
import {useT} from 'use-t';
import {Space} from '../../3-list-item/Space';
import {ColorPicker, type ColorPickerProps} from '../../4-card/ColorPicker';
import {InputColor, type InputColorProps} from '../../2-inline-block/InputColor';
import {HslColor} from '../../styles/color';

const REG_VALID = /^#?([0-9A-F]{3}|([0-9A-F]{6}([0-9a-f]{2})?))$/i;

export const isValid = (color: string) => {
  return REG_VALID.test(color);
};

export interface ColorPickerInputProps extends ColorPickerProps {
  input?: InputColorProps;
}

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({input, ...rest}) => {
  const [t] = useT();

  const color = rest.color;

  return (
    <div style={{minWidth: 'calc(min(240px, 100vw))'}}>
      <InputColor
        label={t('Color')}
        {...input}
        value={typeof color === 'string' ? color : color?.toRgb().hex() || ''}
        onChange={(v) => {
          if (isValid(v)) {
            rest.onChange?.(HslColor.from(v) ?? HslColor.from('#000000')!);
          }
        }}
      />
      <Space />
      <ColorPicker style={{width: '100%'}} {...rest} />
    </div>
  );
};
