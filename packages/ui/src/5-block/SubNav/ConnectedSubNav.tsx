import * as React from 'react';
import {SubNav} from './SubNav';
import {ConnectedBreadcrumbs} from '../../3-list-item/Breadcrumbs';
import {useNiceUiServices} from '../../context';
import {useBehaviorSubject} from '../../hooks/useBehaviorSubject';

export type ConnectedSubNavProps = {};

export const ConnectedSubNav: React.FC<ConnectedSubNavProps> = () => {
  const services = useNiceUiServices();
  const steps = useBehaviorSubject(services.nav.steps$);

  const backTo = steps.length > 0 ? '/' + steps.slice(0, -1).join('/') : undefined;

  return (
    <SubNav backTo={backTo}>
      <ConnectedBreadcrumbs />
    </SubNav>
  );
};
