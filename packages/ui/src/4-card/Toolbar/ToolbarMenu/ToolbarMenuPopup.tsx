import * as React from 'react';
import {useT} from 'use-t';
import type {MenuItem} from '../../StructuralMenu/types';
import {ContextMenu} from '../../ContextMenu';
import type {PopupProps} from '../../Popup';
import {ContextHeader} from '../../ContextMenu/ContextHeader';
import {Breadcrumb} from '../../../3-list-item/Breadcrumbs';
import {PopupControlled} from '../../Popup/PopupControlled';
import {useAnchorPointHandle, anchorContext} from '../../../utils/popup';
import {Flex} from '../../../3-list-item/Flex';
import {MoveToViewport} from '../../../utils/popup/MoveToViewport';
import type {AnchorPointComputeSpec} from '../../../utils/popup/types';

const popupAnchor: AnchorPointComputeSpec = {
  center: true,
  gap: 12,
};

export interface ToolbarMenuPopupProps extends Pick<PopupProps, 'tooltip'> {
  open: boolean;
  header?: boolean;
  item: MenuItem;
  children: React.ReactNode;
}

export const ToolbarMenuPopup: React.FC<ToolbarMenuPopupProps> = ({open, header, item, children}) => {
  const [t] = useT();
  const handle = useAnchorPointHandle(popupAnchor);

  const renderContext = () => (
    <MoveToViewport>
      <ContextMenu
        inset
        pane={{
          style: {
            width: 242,
          },
        }}
        menu={item}
        header={
          header ? (
            <ContextHeader compact>
              {item.icon ? (
                <Flex style={{alignItems: 'center'}}>
                  <div style={{width: 16, height: 16}}>
                    <span
                      style={{
                        display: 'inline-block',
                        transform: 'scale(.75)',
                        opacity: 0.8,
                        transformOrigin: '50% 100%',
                        verticalAlign: 'bottom',
                        marginTop: -8,
                      }}
                    >
                      {item.icon?.()}&nbsp;
                    </span>
                  </div>
                  <Breadcrumb compact>{t(item.name)}</Breadcrumb>
                </Flex>
              ) : (
                <Breadcrumb compact>{t(item.name)}</Breadcrumb>
              )}
            </ContextHeader>
          ) : (
            void 0
          )
        }
      />
    </MoveToViewport>
  );

  return (
    <anchorContext.Provider value={handle}>
      <PopupControlled refToggle={handle.ref} open={open} renderContext={renderContext}>
        {children}
      </PopupControlled>
    </anchorContext.Provider>
  );
};
