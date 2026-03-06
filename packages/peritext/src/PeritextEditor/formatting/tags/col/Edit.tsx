import * as React from 'react';
import {useT} from 'use-t';
import {useNodeView} from '@jsonjoy.com/collaborative-react';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {isValid, normalize} from './util';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {ColorPicker} from '../../../components/ColorPicker';
import {EditProps} from '../../../types';

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const [t] = useT();
  const obj = formatting.conf()!;
  const view = useNodeView(obj);
  const color = String(view?.col || '#000000');
  const [colorInput, setColorInput] = React.useState(color); 

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
          setColorInput(String(obj.read('/col') || '#000000'));
        }}
        onEnter={() => {
          onSave();
        }}
        right={
          <div style={{width: 32, height: 16, background: color, borderRadius: 2, border: '2px solid #fff', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'}} />
        }
      />
      <Space />
      <ColorPicker
        style={{width: '100%'}}
        color={color}
        onChange={(color) => {
          let hex: string = color.hexa;
          hex = normalize(color.hexa) ?? hex;
          obj.replace('/col', hex);
          setColorInput(hex);
        }}
      />
    </div>
  );
};
