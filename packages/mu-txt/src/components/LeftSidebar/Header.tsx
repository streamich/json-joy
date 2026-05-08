import * as React from 'react';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {useExplorer} from '../../context';
import {BrandLogo} from './BrandLogo';
import {HeaderMenu} from './HeaderMenu';
import {rule} from 'nano-theme';
import {isMacElectron} from '../../util/host';

// Width reserved for the macOS traffic-light controls (close/minimize/zoom).
const TRAFFIC_LIGHT_WIDTH = 78;

const blockClass = rule({
  '-webkit-app-region': 'drag', // Drag for Electron app.
  '& button, & a, & input, & textarea, & select, & [role="button"], & [role="tablist"], & [role="img"]': {
    '-webkit-app-region': 'no-drag',
  },
});

export interface HeaderProps {
  toggle: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({toggle}) => {
  const state = useExplorer();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Split className={blockClass} style={{alignItems: 'center', padding: '0 0 0'}}>
      <Flex style={{alignItems: 'center', gap: 10}}>
        <div style={{width: isMacElectron ? TRAFFIC_LIGHT_WIDTH : 'env(titlebar-area-x)'}} />
        {!isMacElectron && <BrandLogo />}
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
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
        <HeaderMenu />
        {/* {isMacElectron && <BrandLogo />} */}
        {toggle}
      </div>
    </Split>
  );
};
