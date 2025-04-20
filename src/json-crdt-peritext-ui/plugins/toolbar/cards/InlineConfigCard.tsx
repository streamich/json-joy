import * as React from 'react';
import {ContextMenuHeader} from 'nice-ui/lib/4-card/ContextMenu/ContextMenu/ContextMenuHeader';
import {CollaborativeInput} from 'collaborative-ui/lib/CollaborativeInput';
// import {CollaborativeFlexibleInput} from 'collaborative-ui/lib/CollaborativeFlexibleInput';
// import {CollaborativeInput} from '../../../components/CollaborativeInput';
// import {FormRow} from 'nice-ui/lib/3-list-item/FormRow';
import {Input} from 'nice-ui/lib/2-inline-block/Input';
import {FormRow} from './FormRow';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {Breadcrumb} from 'nice-ui/lib/3-list-item/Breadcrumbs';
import {ContextPaneHeader} from '../../../components/ContextPaneHeader';
import {useToolbarPlugin} from '../context';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import type {SliceConfigState} from '../state/types';

export interface InlineConfigCardProps {
  config: SliceConfigState<any>;
}

export const InlineConfigCard: React.FC<InlineConfigCardProps> = ({config}) => {
  const {toolbar} = useToolbarPlugin();
  const api = config.conf();
  const href = React.useMemo(() => () => config.conf().str(['href']), [config]);
  // const href = api.str(['href']);
  // const href = useSelectNode
  // console.log(api + '');
  // console.log(href() + '');


  const icon = config.menu?.icon?.();
  const name = config.menu?.name ?? config.def.name;

  return (
    <ContextPane style={{display: 'block', minWidth: 'calc(min(600px, max(50vw, 260px)))'}}>
      <ContextPaneHeader onCloseClick={() => toolbar.newSliceConfig.next(void 0)}>
        {/* <Breadcrumbs crumbs={[<Breadcrumb>{name}</Breadcrumb>]} /> */}
        {icon ? (
          <Flex style={{alignItems: 'center', display: 'flex'}}>
            <div style={{width: 16, height: 16, transform: 'scale(.87)', opacity: .7, display: 'flex', alignItems: 'center', margin: '0 -1px 0 8px'}}>
              {icon}
            </div>
            <Breadcrumb compact>{name}</Breadcrumb>
          </Flex>
        ) : (
          <Breadcrumb compact>{name}</Breadcrumb>
        )}
      </ContextPaneHeader>
      <div style={{padding: '8px 16px'}}>
        <FormRow title={'Link'}>
          <Input type={'text'} size={-2} placeholder={'https://'} value={''} onChange={() => {}} />
        </FormRow>
        <FormRow title={'Title'}>
          <Input type={'text'} size={-2} placeholder={'Title'} value={''} onChange={() => {}} />
        </FormRow>
      </div>
    </ContextPane>
  );
};
