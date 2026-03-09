import * as React from 'react';
import {useT} from 'use-t';
import {useNodeView} from '@jsonjoy.com/collaborative-react';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {isValid} from '../../../../util/color';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {ColorPicker} from '../../../../components/ColorPicker';
import type {EditProps} from '../../../InlineSliceBehavior';
import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const [t] = useT();
  const obj = formatting.conf()!;
  const view = useNodeView(obj);
  const [color, setColor] = React.useState(HslColor.from(String(view?.col || '#000000')) as HslColor);
  const [colorInput, setColorInput] = React.useState(color.toRgb().hex());

  return (
    <div style={{width: 'calc(min(240px, 100vw))'}}>
      <Input
        label={t('Color')}
        value={colorInput}
        onChange={(value) => {
          setColorInput(value);
          if (isValid(value)) {
            const hex = value.startsWith('#') ? value : `#${value}`;
            obj.replace('/col', hex.toUpperCase());
          }
        }}
        onBlur={() => {
          setColorInput(String(obj.read('/col') || '#000000').toUpperCase());
        }}
        onEnter={() => {
          onSave();
        }}
        right={
          <div
            style={{
              width: 32,
              height: 16,
              background: color.toString(),
              borderRadius: 2,
              border: '2px solid #fff',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
            }}
          />
        }
      />
      <Space />
      <ColorPicker
        style={{width: '100%'}}
        color={color}
        onChange={(newColor) => {
          const hex = newColor.toRgb().hex().toUpperCase();
          setColor(newColor);
          setColorInput(hex);
          obj.replace('/col', hex);
        }}
      />
    </div>
  );
};
