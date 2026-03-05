import * as React from 'react';
import {useT} from 'use-t';
import {useNodeView} from '@jsonjoy.com/collaborative-react';
import ColorPicker from '@uiw/react-color-colorful';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {isValid} from './util';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import type {EditableFormatting} from '../../../state/formattings';

export interface EditProps {
  formatting: EditableFormatting;
  onSave: () => void;
}

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const [t] = useT();
  const obj = formatting.conf()!;
  const view = useNodeView(obj);
  const color = String(view?.color || '#000000');
  const [colorInput, setColorInput] = React.useState(color); 


  return (
    <div style={{width: 'calc(min(240px, 100vw))'}}>
      <Input
        type={'text'}
        isInForm={true}
        label={t('Color')}
        value={colorInput}
        onChange={(value) => {
          setColorInput(value);
          if (isValid(value)) {
            const hex = value.startsWith('#') ? value : `#${value}`;
            obj.replace('/color', hex);
          }
        }}
        onBlur={() => {
          setColorInput(String(obj.read('/color') || '#000000'));
        }}
        right={
          <div style={{width: 32, height: 16, background: color, borderRadius: 2, border: '1px solid #fff', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'}} />
        }
      />
      <Space />
      <ColorPicker
        style={{width: '100%'}}
        color={color}
        onChange={(color) => {
          obj.replace('/color', color.hexa);
          setColorInput(color.hex);
        }}
      />
    </div>
  );
};
