import * as React from 'react';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {context as popupContext} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {ClickAway} from '@jsonjoy.com/ui/lib/utils/ClickAway';
import {PositionAtPoint} from '@jsonjoy.com/ui/lib/utils/popup/PositionAtPoint';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup';
import {FileOptionsForm2} from './FileOptionsForm2';
import type {FileMetadataDto} from '../../../state/file';

export interface FileOptionsContextPaneProps {
  file: FileMetadataDto;
  point: AnchorPoint;
  onClose: () => void;
}

export const FileOptionsContextPane: React.FC<FileOptionsContextPaneProps> = ({file, point, onClose}) => {
  const popupCtx = React.useMemo(() => ({close: onClose}), [onClose]);
  return (
    <PositionAtPoint point={point}>
      <ClickAway onClickAway={onClose}>
        <popupContext.Provider value={popupCtx}>
          <MoveToViewport>
            <FileOptionsForm2 file={file} />
          </MoveToViewport>
        </popupContext.Provider>
      </ClickAway>
    </PositionAtPoint>
  );
};
