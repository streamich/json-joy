import * as React from 'react';
import {pageutils} from '../../../../6-page/DocsPages/util';
import {content} from '../../../content';
import {useNiceUiServices} from '../../../../context';
import {useBehaviorSubject} from '../../../../hooks/useBehaviorSubject';
import {DocsFooter} from '../../components/DocsFooter';
import {IconsPageLayout} from './IconsPageLayout';
import {Space} from '../../../../3-list-item/Space';

const page = pageutils.find(content, ['guidelines'])!;

export type Props = {};

export const IconsPage: React.FC<Props> = () => {
  const services = useNiceUiServices();
  const [_, ...steps] = useBehaviorSubject(services.nav.steps$);

  if (!page) return null;

  return (
    <>
      <Space size={2} />
      {/* <ConnectedSubNav /> */}
      <IconsPageLayout steps={steps} />
      <DocsFooter />
    </>
  );
};
