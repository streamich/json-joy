import * as React from 'react';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {useExplorer} from '../../context';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {BrandLogo} from './BrandLogo';

export interface HeaderProps {
  toggle: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({toggle}) => {
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const newMenu = state.menus.newFileMenu();
  const hasOpenFiles = files.length > 0;
  const menu = React.useMemo(() => {
    const menu: MenuItem = {
      name: 'File Actions',
      minWidth: 240,
      children: [
        {
          name: 'New File',
          minWidth: 300,
          icon: () => <Iconista set="ibm_16" icon="new-tab" width={16} height={16} />,
          children: [
            newMenu,
            {name: 'after-new', sep: true},
            ...state.menus.tracesMenu(300, async (wait) => {}).children!,
          ],
        },
        {
          name: 'Import File',
          icon: () => <Iconista set="ant_outline" icon="import" width={16} height={16} />,
          onSelect: () => inputRef.current?.click(),
        },
        ...(hasOpenFiles
          ? [
              {name: 'close-sep', sep: true},
              {
                name: 'Close all',
                icon: () => <Iconista set="bootstrap" icon="x" width={16} height={16} />,
                onSelect: () => state.closeAll(),
              },
            ]
          : []),
      ],
    };
    return menu;
  }, [hasOpenFiles]);

  return (
    <Split style={{alignItems: 'center', padding: '0 0 0 8px'}}>
      <Flex style={{alignItems: 'center', gap: 10}}>
        <BrandLogo />
        <Popup renderContext={() => <ContextMenu inset menu={menu} />}>
          <BasicButtonMore tooltip size={28} rounder />
        </Popup>
        <input
          multiple
          type="file"
          ref={inputRef}
          style={{display: 'none'}}
          onChange={() => {
            const input = inputRef.current;
            if (!input) return;
            const files = input.files;
            if (files) state.addFiles(Array.from(files));
          }}
        />
      </Flex>
      {toggle}
    </Split>
  );
};
