import * as React from 'react';
import {useFocused, useSelected, type RenderElementProps} from 'slate-react';
import {useMuTxt} from '../../../context';
import {BrokenFileCard} from './BrokenFileCard';
import {ResolvedFileCard} from './ResolvedFileCard';
import type {FileElement as FileElementType, FileThing} from '../../../types';

export interface FileElementProps extends RenderElementProps {
  element: FileElementType;
}

export const FileElement: React.FC<FileElementProps> = ({attributes, children, element}) => {
  const mutxt = useMuTxt();
  mutxt.things.version.use();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const selected = isSelected && isFocused;

  const thingId = element['@thing'];
  const thing = thingId ? (mutxt.things.get(thingId) as FileThing | undefined) : undefined;

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        {thing ? (
          <ResolvedFileCard thing={thing} selected={selected} element={element} />
        ) : (
          <BrokenFileCard thingId={thingId} selected={selected} />
        )}
      </div>
      {children}
    </div>
  );
};
