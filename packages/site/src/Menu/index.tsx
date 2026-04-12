import * as React from 'react';
import {rule} from 'nano-theme';
import {NiceUiSizes} from '@jsonjoy.com/ui/lib/constants';
import JsonJoyLogo from '@jsonjoy.com/ui/lib/icons/svg/JsonJoyLogo';
import type {NiceUiNavService} from '@jsonjoy.com/ui/lib/context/services/NiceUiNavService';

const blockClass = rule({
  pos: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  z: 100,
  h: NiceUiSizes.TopNavHeight + 'px',
  d: 'flex',
  ai: 'center',
  px: '24px',
  bxz: 'border-box',
  borderBottom: '1px solid rgba(128,128,128,0.12)',
  bdfl: 'saturate(170%) blur(14px)',
});

interface MenuProps {
  nav: NiceUiNavService;
}

export const Menu: React.FC<MenuProps> = ({nav}) => {

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      nav.go(href);
    }
  };

  return (
    <nav className={blockClass}>
      <a href="/" onClick={(e) => handleNav(e, '/')}>
        <JsonJoyLogo color size={24} />
      </a>
      <a href="/docs" onClick={(e) => handleNav(e, '/docs')}>
        Docs
      </a>
    </nav>
  );
};
