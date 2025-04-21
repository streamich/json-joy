import * as React from 'react';
import {FormRow} from './FormRow';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {ContextTitle} from 'nice-ui/lib/4-card/ContextMenu/ContextTitle';
import {EmptyState} from 'nice-ui/lib/4-card/EmptyState';
import {Breadcrumbs, Breadcrumb} from 'nice-ui/lib/3-list-item/Breadcrumbs';
import {ContextPaneHeader} from '../../../components/ContextPaneHeader';
import {useToolbarPlugin} from '../context';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {CollaborativeInput} from '../../../components/CollaborativeInput';
import {Input} from '../../../components/Input';
import {useSyncStore} from '../../../web/react/hooks';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {UrlDisplayCard} from './UrlDisplayCard';
import type {SliceConfigState} from '../state/types';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';

export interface InlineConfigCardProps {
  config: SliceConfigState<any>;
  onSave: () => void;
}

export const InlineConfigCard: React.FC<InlineConfigCardProps> = ({config, onSave}) => {
  const {toolbar} = useToolbarPlugin();
  const api = config.conf();
  const href = React.useMemo(() => () => config.conf().str(['href']), [config]);
  const title = React.useMemo(() => () => config.conf().str(['title']), [config]);
  const hrefView = useSyncStore(href().events);

  const icon = config.menu?.icon?.();
  const name = config.menu?.name ?? config.def.name;

  return (
    <ContextPane style={{display: 'block', minWidth: 'calc(min(600px, max(50vw, 260px)))'}}>
      <form onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}>
        <ContextPaneHeader onCloseClick={() => toolbar.newSliceConfig.next(void 0)}>
          {icon ? (
            <Flex style={{alignItems: 'center', display: 'flex', fontSize: '14px'}}>
              {/* <Avatar width={24} height={24} badge={icon} /> */}
              <div style={{transform: 'scale(.8)', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.1)', opacity: .7, margin: '0 6px 0 8px'}}>
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
          <FormRow>
            <CollaborativeInput str={href}
              input={(ref) => <Input focus inp={ref} type={'text'} size={-1} placeholder={'https://'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSave();
                }
              }} right={(
                <div style={{paddingRight: 8, width: 24, height: 24}}>
                  {!!hrefView && <BasicButtonClose onClick={() => href().del(0, href().length())} />}
                </div>
              )}
              />} />
          </FormRow>
          {/* <FormRow title={'Title'}>
            <CollaborativeInput str={title}
              input={(ref) => <Input inp={ref} type={'text'} size={-1} placeholder={'Title'} />} />
          </FormRow> */}
        </div>

        <ContextSep line />
        <ContextSep />
        <ContextTitle>Preview</ContextTitle>
        {hrefView ? (
          <div style={{display: 'flex', padding: '24px 16px 32px', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{maxWidth: 440}}>
              <UrlDisplayCard url={hrefView} />
            </div>
          </div>
        ) : <EmptyState emoji=' ' title=' ' />}
        <ContextSep line />
        
        {/* <div style={{padding: '4px 16px'}}> */}
        <div style={{padding: '0px 16px'}}>
          <FormRow>
            <Button small lite block disabled={!hrefView} submit>Save</Button>
          </FormRow>
        </div>
      </form>
    </ContextPane>
  );
};
