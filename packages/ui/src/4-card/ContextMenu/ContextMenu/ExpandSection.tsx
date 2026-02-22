import * as React from 'react';
import {useT} from 'use-t';
import {useContextMenu} from './context';
import {ContextItem} from '../ContextItem';
import {Code} from '../../../1-inline/Code';
import {Iconista} from '../../../icons/Iconista';
import {ContextTitleNested} from '../ContextTitleNested';
import {Flex} from '../../../3-list-item/Flex';
import {bigIconsState, line} from './util';
import type {MenuItem} from '../../StructuralMenu/types';

export interface ExpandSectionProps {
  path: MenuItem[];
  menu: MenuItem;
  child: MenuItem;
  renderItem: (item: MenuItem) => React.ReactNode;
  renderPane: (item: MenuItem) => React.ReactNode;
  open?: boolean;
  onTitleMouseEnter: React.MouseEventHandler;
  onTitleMouseMove: React.MouseEventHandler;
  onTitleMouseLeave: React.MouseEventHandler;
}

export const ExpandSection: React.FC<ExpandSectionProps> = (props) => {
  const {path, menu, child, renderItem, renderPane, open, onTitleMouseEnter, onTitleMouseLeave, onTitleMouseMove} =
    props;
  const [t] = useT();
  const state = useContextMenu();
  const [all, setAll] = React.useState(child.expand === (child.children?.length ?? 0) - 1);

  const nodes: React.ReactNode[] = [];
  const subChildren = child.children;
  if (!subChildren) return null;
  const expand = child.expand;
  if (!expand) return null;
  const bigIcons = bigIconsState(nodes, menu);

  for (let j = 0; j < subChildren.length && j < (all ? 1000 : expand); j++) {
    const subChild = subChildren[j];
    if (subChild.sep || subChild.sepBefore) {
      bigIcons.flush();
      const key = subChild.id ?? subChild.name;
      nodes.push(line(key, true));
      if (!subChild.sepBefore) continue;
    }
    if (subChild.iconBig) bigIcons.push(subChild);
    else {
      bigIcons.flush();
      nodes.push(renderItem(subChild));
    }
  }
  bigIcons.flush();

  let remaining = subChildren.length - expand;
  for (let j = expand; j < subChildren.length; j++) {
    const subChild = subChildren[j];
    if (subChild.sep) {
      remaining--;
    }
  }

  const showMoreButton = !all && remaining > 0;

  return (
    <>
      <ContextTitleNested
        key={child.id ?? child.name}
        icon={child.icon?.()}
        open={open && (showMoreButton || child.openOnTitleHov)}
        onClick={() => state.select([...path, menu], child)}
        renderPane={() => renderPane(child)}
        onMouseEnter={onTitleMouseEnter}
        onMouseLeave={onTitleMouseLeave}
        onMouseMove={onTitleMouseMove}
      >
        {child.display?.() ?? t(child.name)}
      </ContextTitleNested>
      {nodes}
      {showMoreButton && (
        <ContextItem
          compact
          bg
          more
          inset={state.props.inset}
          // icon={<Iconista style={{opacity: .5}} width={15} height={15} set={'radix'} icon={'dots-vertical'} />}
          // icon={<Iconista width={16} height={16} set={'elastic'} icon={'empty'} />}
          onClick={() => setAll(true)}
          icon={
            <Flex style={{width: 16, height: 16, justifyContent: 'center', alignItems: 'end'}}>
              <Iconista width={12} height={12} set={'radix'} icon={'arrow-down'} style={{opacity: 0.7}} />
            </Flex>
          }
        >
          <Code size={-1} gray spacious roundest>
            +{remaining} {t('more')}
          </Code>
        </ContextItem>
      )}
    </>
  );
};
