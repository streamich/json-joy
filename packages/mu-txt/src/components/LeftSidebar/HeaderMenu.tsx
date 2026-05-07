import * as React from 'react';
import {useExplorer} from '../../context';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Tabs} from '@jsonjoy.com/ui/lib/3-list-item/Tabs';
import {useT} from 'use-t';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {ThemePreference} from '../../state/theme';

export type HeaderMenuProps = {};

const ThemeTabs: React.FC = () => {
  const [t] = useT();
  const state = useExplorer();
  const preference = state.theme.preference.use();
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 8,
        padding: '0 8px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Tabs
        spread
        contentStyle={{
          display: 'flex',
          gap: 0,
        }}
        onChange={(key) => state.theme.set(key as ThemePreference)}
        active={preference}
        items={[
          {
            key: 'auto',
            label: (
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <Iconista set="tabler" icon="automatic-gearbox" width={16} height={16} />
                <span style={{fontSize: 12}}>{t('Auto')}</span>
              </span>
            ),
          },
          {
            key: 'light',
            label: (
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <Iconista set="ibm_32" icon="light" width={16} height={16} />
                <span style={{fontSize: 12}}>{t('Light')}</span>
              </span>
            ),
          },
          {
            key: 'dark',
            label: (
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <Iconista set="lucide" icon="lamp-desk" width={16} height={16} />
                <span style={{fontSize: 12}}>{t('Dark')}</span>
              </span>
            ),
          },
        ]}
      />
    </span>
  );
};

export const HeaderMenu: React.FC<HeaderMenuProps> = () => {
  const state = useExplorer();

  return (
    <Popup
      renderContext={() => (
        <ContextMenu
          inset
          menu={{
            name: 'Site menu',
            minWidth: 288,
            children: [
              {
                name: 'Close all files',
                icon: () => <Iconista set="ant_outline" icon="poweroff" width={16} height={16} />,
                onSelect: state.closeAll,
              },
              {
                name: 'Theme',
                sepBefore: true,
                raw: () => <ThemeTabs />,
              },
            ],
          }}
        />
      )}
    >
      <BasicButtonMore tooltip size={28} rounder />
    </Popup>
  );
};
