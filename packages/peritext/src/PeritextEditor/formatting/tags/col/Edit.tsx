import * as React from 'react';
import {useT} from 'use-t';
import {useNodeView} from '@jsonjoy.com/collaborative-react';
import ColorPicker from '@uiw/react-color-colorful';
import type {EditableFormatting} from '../../../state/formattings';

export interface EditProps {
  formatting: EditableFormatting;
  onSave: () => void;
}

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const [t] = useT();
  console.log('formatting.conf()', formatting.conf());
  const view = useNodeView(formatting.conf());

  return (
    <div>
      <ColorPicker
        color={String(view?.color || '#000000')}
        onChange={(color) => {
          formatting.conf()?.replace('/color', color.hex);
        }}
      />
    </div>
  );
};
