import * as React from 'react';
import {useEditor} from '../../state/context';
import {CaretFrame} from '../util/CaretFrame';
import {FmtNewPane} from '../../inline/components/FmtNewPane';
import {useSyncStoreOpt} from '../../../web/react/hooks';
import {BottomPanePortal} from '../util/BottomPanePortal';
import type {CaretViewProps} from '../../../web/react/cursor/CaretView';
import {FocusOver} from './FocusOver';

export interface RenderFocusProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderFocus: React.FC<RenderFocusProps> = (props) => {
  const {children, cursor} = props;
  const state = useEditor()!;
  const {surface, selection} = state;
  const newSlice = selection.newSlice.use();
  const isScrubbing = useSyncStoreOpt(surface.dom?.cursor.mouseDown) || false;

  let under: React.ReactNode | undefined;

  if (newSlice && !isScrubbing && state.txt.editor.mainCursor() === cursor) {
    under = (
      <BottomPanePortal>
        <FmtNewPane formatting={newSlice} onSave={() => newSlice.save()} />
      </BottomPanePortal>
    );
  }

  return (
    <CaretFrame over={<FocusOver {...props} />} under={under}>
      {children}
    </CaretFrame>
  );
};
