import * as React from 'react';
import {useT} from 'use-t';
import {ContextHeader} from '../ContextHeader';
import {useContextMenu} from './context';
import {useBehaviorSubject} from '../../../hooks/useBehaviorSubject';
import {BasicButtonBack} from '../../../2-inline-block/BasicButton/BasicButtonBack';
import {Breadcrumb, Breadcrumbs} from '../../../3-list-item/Breadcrumbs';
import {Flex} from '../../../3-list-item/Flex';
import {ContextPaneHeaderSep} from '../ContextPaneHeaderSep';

export type ContextMenuHeaderProps = {};

export const ContextMenuHeader: React.FC<ContextMenuHeaderProps> = (props) => {
  const [t] = useT();
  const state = useContextMenu();
  const path = useBehaviorSubject(state.path$);
  const menu = useBehaviorSubject(state.menu$);

  const crumbs = [
    ...path.map((item, index) => (
      <Breadcrumb key={item.id ?? item.name} compact onClick={() => state.selectInPath(index)}>
        {!index ? '~' : t(item.name)}
      </Breadcrumb>
    )),
    <Breadcrumb key={menu.id ?? menu.name} compact>
      {t(menu.name)}
    </Breadcrumb>,
  ];

  return (
    <>
      <ContextHeader compact>
        <Flex style={{alignItems: 'center'}}>
          <BasicButtonBack onClick={state.selectBack} />
          <Breadcrumbs compact crumbs={crumbs} style={{padding: '0 0 0 2px'}} />
        </Flex>
      </ContextHeader>
      <ContextPaneHeaderSep />
    </>
  );
};
