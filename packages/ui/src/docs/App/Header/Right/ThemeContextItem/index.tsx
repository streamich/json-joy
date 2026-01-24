import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../../../../4-card/ContextMenu';
import {Split} from '../../../../../3-list-item/Split';
import {Checkbox} from '../../../../../2-inline-block/Checkbox';
import {useNiceUiServices} from '../../../../../context';
import {useBehaviorSubject} from '../../../../../hooks/useBehaviorSubject';

export type Props = {};

export const ThemeContextItem: React.FC<Props> = () => {
  const [t] = useT();
  const services = useNiceUiServices();
  const theme = useBehaviorSubject(services.theme$);

  const isLight = theme !== 'dark';
  const handleClick = () => services.setTheme(isLight ? 'dark' : 'light');

  return (
    <ContextItem onClick={handleClick}>
      <Split style={{alignItems: 'center'}}>
        <span>{isLight ? t('Light theme') : t('Dark theme')}</span>
        <Checkbox as="span" small on={isLight} />
      </Split>
    </ContextItem>
  );
};
