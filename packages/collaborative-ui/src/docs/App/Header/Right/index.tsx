import * as React from 'react';
import {useT} from 'use-t';
import {BasicButtonMore} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Popup} from 'nice-ui/lib/4-card/Popup';
import {ContextItem, ContextPane, ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {ThemeContextItem} from './ThemeContextItem';

export type Props = Record<string, never>;

export const Right: React.FC<Props> = () => {
  const [t] = useT();

  return (
    <div>
      <Popup
        renderContext={() => (
          <ContextPane right style={{minWidth: 260}}>
            <ContextSep />
            <ContextItem closePopup to={'https://github.com/streamich/nice-ui'}>
              <Split style={{alignItems: 'center'}}>
                <span>{t('GitHub repository')}</span>
                <Iconista set="fontawesome_brands" icon="github" width={16} height={16} />
              </Split>
            </ContextItem>
            <ContextSep />
            <ContextSep line />
            <ContextSep />
            <ThemeContextItem />
            <ContextSep />
          </ContextPane>
        )}
      >
        <BasicButtonMore size={32} />
      </Popup>
    </div>
  );
};
