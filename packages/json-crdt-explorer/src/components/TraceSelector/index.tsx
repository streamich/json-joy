import * as React from 'react';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useT} from 'use-t';
import {useExplorer} from '../../context';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';

const ShopIcon = makeIcon({set: 'ant_outline', icon: 'shop'});

export interface TraceSelectorProps {
  width?: number;
  expanded?: boolean;
}

export const TraceSelector: React.FC<TraceSelectorProps> = ({width = 240, expanded}) => {
  const [t] = useT();
  const state = useExplorer();
  const [loading, setLoading] = React.useState(false);

  const load = async (wait: Promise<void>) => {
    setLoading(true);
    await wait;
    setLoading(false);
  };

  const menu: MenuItem = React.useMemo(() => state.menus.tracesMenu(width, load), [width, t]);

  return (
    <Popup
      block
      renderContext={() => (
        <ContextMenu
          inset
          menu={menu}
          pane={{style: {width}}}
        />
      )}
    >
      <Button
        block
        ghost
        radius={1}
        icon={<ShopIcon width={16} height={16} />}
        loading={loading}
        disabled={loading}
        size={expanded ? 1 : -1}
      >
        {t('Load trace')}
      </Button>
    </Popup>
  );
};

