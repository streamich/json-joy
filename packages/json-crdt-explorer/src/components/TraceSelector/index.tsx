import * as React from 'react';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {useT} from 'use-t';
import {useExplorer} from '../../context';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import ShopIcon__svg from 'iconista/lib/react/ant_outline/shop';

const ShopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ShopIcon__svg {...props} />;

export interface TraceSelectorProps {
  expanded?: boolean;
}

export const TraceSelector: React.FC<TraceSelectorProps> = ({expanded}) => {
  const [t] = useT();
  const state = useExplorer();
  const [loading, setLoading] = React.useState(false);

  const load = async (wait: Promise<void>) => {
    setLoading(true);
    await wait;
    setLoading(false);
  };

  const menu: MenuItem = React.useMemo(() => state.menus.tracesMenu(300, load), []);

  return (
    <Popup block renderContext={() => <ContextMenu inset menu={menu} />}>
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
