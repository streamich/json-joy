import * as React from 'react';
import {useTheme} from 'nano-theme';
import {useT} from 'use-t';
import {MobileMenuHeader} from './MobileMenuHeader';
import {MobileMenuItem} from './MobileMenuItem';
import {listClass, sectionTitleClass, separatorClass} from './styles';
import type {MenuItem} from '../../StructuralMenu/types';

export interface MobileMenuPaneProps {
  menu: MenuItem;
  parent?: MenuItem;
  onPush: (item: MenuItem) => void;
  onBack: () => void;
  onClose: () => void;
  onSelectArgs: (item: MenuItem) => void;
}

export const MobileMenuPane: React.FC<MobileMenuPaneProps> = ({
  menu,
  parent,
  onPush,
  onBack,
  onClose,
  onSelectArgs,
}) => {
  const [t] = useT();
  const theme = useTheme();
  const children = menu.children ?? [];

  const sepColor = theme.g(0, 0.08);
  const titleColor = theme.g(0.5);

  const renderSeparator = (key: string) => (
    <div key={key} className={separatorClass({bg: sepColor})} aria-hidden="true" />
  );
  const renderItem = (item: MenuItem, key: string) => (
    <MobileMenuItem key={key} item={item} onPush={onPush} onSelectArgs={onSelectArgs} onClose={onClose} />
  );

  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const id = child.id ?? child.name;
    if (child.sep) {
      nodes.push(renderSeparator(`sep-${id}`));
      continue;
    }
    if (child.sepBefore && i > 0) {
      nodes.push(renderSeparator(`sepb-${id}`));
    }
    if (child.expand && child.children && child.children.length) {
      nodes.push(
        <div key={`title-${id}`} className={sectionTitleClass({col: titleColor})}>
          {t(child.name)}
        </div>,
      );
      const inlineCount = Math.min(child.expand, child.children.length);
      for (let j = 0; j < inlineCount; j++) {
        const sub = child.children[j];
        const subId = sub.id ?? sub.name;
        if (sub.sep) {
          nodes.push(renderSeparator(`${id}-sep-${subId}`));
          continue;
        }
        if (sub.sepBefore && j > 0) {
          nodes.push(renderSeparator(`${id}-sepb-${subId}`));
        }
        nodes.push(renderItem(sub, `${id}-${subId}`));
      }
      if (child.children.length > inlineCount) {
        nodes.push(renderItem({...child, onSelect: undefined}, `${id}-more`));
      }
      continue;
    }
    nodes.push(renderItem(child, id));
  }

  return (
    <>
      <MobileMenuHeader title={t(menu.name)} parent={parent} onBack={onBack} onClose={onClose} />
      <div className={listClass()} role="menu" aria-label={t(menu.name)}>
        {nodes}
      </div>
    </>
  );
};
