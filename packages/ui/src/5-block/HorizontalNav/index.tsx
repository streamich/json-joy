import * as React from 'react';
import {rule} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Popup} from '../../4-card/Popup';
import {ContextItem, ContextPane, ContextSep} from '../../4-card/ContextMenu';
import BasicButton from '../../2-inline-block/BasicButton';
import {Iconista} from '../../icons/Iconista';
import {PillButton} from '../../2-inline-block/PillButton';

const blockClass = rule({
  d: 'flex',
  alignItems: 'center',
});

export interface Item {
  node: React.ReactNode;
  to: string;
  tooltip?: string;
  active?: boolean;
  noTick?: boolean;
}

export interface Props {
  items: Item[];
  right?: boolean;
}

export const HorizontalNav: React.FC<Props> = ({items, right}) => {
  const {width} = useWindowSize();

  if (width < 800) {
    return (
      <Popup
        renderContext={() => (
          <ContextPane>
            <ContextSep />
            {items.map((item) => (
              <ContextItem big key={item.to} to={item.to}>
                {item.node}
              </ContextItem>
            ))}
            <ContextSep />
          </ContextPane>
        )}
      >
        <BasicButton border size={32}>
          <Iconista set="ant_outline" icon="menu" width={16} height={16} />
        </BasicButton>
      </Popup>
    );
  }

  return (
    <nav className={blockClass}>
      {items.map((item) => (
        <PillButton key={item.to} a to={item.to} active={item.active}>
          {item.node}
        </PillButton>
      ))}
    </nav>
  );
};
