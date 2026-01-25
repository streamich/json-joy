import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {useNiceUiServices} from '@jsonjoy.com/ui/lib/context';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';

export type Props = Record<string, never>;

export const ThemeContextItem: React.FC<Props> = () => {
  const [t] = useT();
  const services = useNiceUiServices();
  const theme = useBehaviorSubject(services.theme$);

  const isLight = theme !== 'dark';
  const handleClick = () => services.setTheme(isLight ? 'dark' : 'light');

  return (
    <ContextItem closePopup onClick={handleClick}>
      <Split style={{alignItems: 'center'}}>
        <span>{isLight ? t('Light theme') : t('Dark theme')}</span>
        <Checkbox as="span" small on={isLight} />
      </Split>
    </ContextItem>
  );
};
