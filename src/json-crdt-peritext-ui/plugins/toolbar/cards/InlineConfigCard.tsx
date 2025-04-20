import * as React from 'react';
import {FormRow} from './FormRow';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {Breadcrumbs, Breadcrumb} from 'nice-ui/lib/3-list-item/Breadcrumbs';
import {ContextPaneHeader} from '../../../components/ContextPaneHeader';
import {useToolbarPlugin} from '../context';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {CollaborativeInput} from '../../../components/CollaborativeInput';
import {Input} from '../../../components/Input';
import type {SliceConfigState} from '../state/types';

export interface InlineConfigCardProps {
  config: SliceConfigState<any>;
}

export const InlineConfigCard: React.FC<InlineConfigCardProps> = ({config}) => {
  const {toolbar} = useToolbarPlugin();
  const api = config.conf();
  const href = React.useMemo(() => () => config.conf().str(['href']), [config]);
  const title = React.useMemo(() => () => config.conf().str(['title']), [config]);


  const icon = config.menu?.icon?.();
  const name = config.menu?.name ?? config.def.name;

  return (
    <ContextPane style={{display: 'block', minWidth: 'calc(min(600px, max(50vw, 260px)))'}}>
      <ContextPaneHeader onCloseClick={() => toolbar.newSliceConfig.next(void 0)}>
        {icon ? (
          <Flex style={{alignItems: 'center', display: 'flex', fontSize: '14px'}}>
            <div style={{width: 16, height: 16, transform: 'scale(.87)', opacity: .7, display: 'flex', alignItems: 'center', margin: '0 4px 0 8px'}}>
              {icon}
            </div>
            {name}
            {/* <Breadcrumbs crumbs={[<Breadcrumb compact>{name}</Breadcrumb>]} /> */}
          </Flex>
        ) : (
          <Breadcrumbs crumbs={[<Breadcrumb compact>{name}</Breadcrumb>]} />
        )}
      </ContextPaneHeader>
      <div style={{padding: '8px 16px'}}>
        <FormRow title={'Address'}>
          <CollaborativeInput str={href}
            input={(ref) => <Input inp={ref} type={'text'} size={-1} placeholder={'https://'} />} />
        </FormRow>
        <FormRow title={'Title'}>
          <CollaborativeInput str={title}
            input={(ref) => <Input inp={ref} type={'text'} size={-1} placeholder={'Title'} />} />
        </FormRow>
      </div>
    </ContextPane>
  );
};
