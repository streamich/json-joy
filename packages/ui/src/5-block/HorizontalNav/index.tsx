import * as React from 'react';
import {rule, drule} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Link} from 'react-router-lite';
import BasicButton from '../../2-inline-block/BasicButton';
import {Iconista} from '../../icons/Iconista';
import {PillButton} from '../../2-inline-block/PillButton';
import {OverlayDrawer} from '../Drawer/components/OverlayDrawer';
import {DrawerHeader} from '../Drawer/components/DrawerHeader';
import {DrawerBody} from '../Drawer/components/DrawerBody';
import {useStyles} from '../../styles/context';
import {BasicButtonClose} from '../../2-inline-block/BasicButton/BasicButtonClose';

const blockClass = rule({
  d: 'flex',
  alignItems: 'center',
});

const drawerTitleClass = rule({
  fz: '15px',
  fw: 600,
  flex: 1,
});

const drawerListClass = rule({
  d: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

const drawerItemClass = drule({
  d: 'flex',
  ai: 'center',
  pad: '12px 14px',
  bdrad: '10px',
  fz: '15px',
  td: 'none',
  cur: 'pointer',
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
}

export const HorizontalNav: React.FC<Props> = ({items}) => {
  const {width} = useWindowSize();
  const [open, setOpen] = React.useState(false);
  const styles = useStyles();

  if (width < 900) {
    const link = styles.col.get('link', 'solid-1');
    return (
      <>
        <BasicButton round size={42} onClick={() => setOpen(true)}>
          <Iconista set="bootstrap" icon="layout-sidebar" width={16} height={16} />
        </BasicButton>
        <OverlayDrawer
          open={open}
          onOpenChange={(next) => setOpen(next)}
          side="left"
          width={300}
          aria-label="Navigation"
        >
          <DrawerHeader>
            <span className={drawerTitleClass}></span>
            <BasicButtonClose size={32} round onClick={() => setOpen(false)} aria-label="Close menu" />
          </DrawerHeader>
          <DrawerBody>
            <div className={drawerListClass}>
              {items.map((item) => {
                const itemCls = drawerItemClass({
                  col: item.active ? link : styles.g(0, 0.9),
                  bg: item.active ? 'rgba(0,128,255,.06)' : 'transparent',
                  '&:hover': {
                    bg: item.active ? 'rgba(0,128,255,.08)' : styles.g(0.96),
                    col: item.active ? link : styles.light ? '#000' : '#fff',
                  },
                });
                return (
                  <Link key={item.to} a to={item.to} className={itemCls} onClick={() => setOpen(false)}>
                    {item.node}
                  </Link>
                );
              })}
            </div>
          </DrawerBody>
        </OverlayDrawer>
      </>
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
