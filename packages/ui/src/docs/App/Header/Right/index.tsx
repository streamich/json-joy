import * as React from 'react';
import {useT} from 'use-t';
import {BasicButtonMore} from '../../../../2-inline-block/BasicButton/BasicButtonMore';
import {Popup} from '../../../../4-card/Popup';
import {ContextItem, ContextPane, ContextSep} from '../../../../4-card/ContextMenu';
import {Iconista} from '../../../../icons/Iconista';
import {Split} from '../../../../3-list-item/Split';
import {ThemeContextItem} from './ThemeContextItem';

export type Props = {};

export const Right: React.FC<Props> = () => {
  const [t] = useT();

  return (
    <div>
      <Popup
        renderContext={() => (
          <ContextPane right style={{minWidth: 260}}>
            <ContextSep />
            <ContextItem to={'https://github.com/streamich/json-joy/tree/master/packages/ui'}>
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
