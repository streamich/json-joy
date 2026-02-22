import * as React from 'react';
import {HorizontalNav} from '@jsonjoy.com/ui/lib/5-block/HorizontalNav';
import {content} from '../../../content';
import {useNiceUiServices} from '@jsonjoy.com/ui/lib/context';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useT} from 'use-t';
import {Logo} from './Logo';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';

export type Props = Record<string, never>;

export const Left: React.FC<Props> = () => {
  const [t] = useT();
  const services = useNiceUiServices();
  const steps = useBehaviorSubject(services.nav.steps$);

  return (
    <Flex>
      <Logo />
      <Space horizontal size={4} />
      <HorizontalNav
        items={content.children!.map((page) => ({
          node: t(page.name),
          tooltip: t(page.title || page.name),
          to: page.to ?? '',
          active: steps[0] === page.slug,
        }))}
      />
    </Flex>
  );
};
