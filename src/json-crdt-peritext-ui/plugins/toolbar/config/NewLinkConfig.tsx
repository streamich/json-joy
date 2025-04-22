import * as React from 'react';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {ContextTitle} from 'nice-ui/lib/4-card/ContextMenu/ContextTitle';
import {EmptyState} from 'nice-ui/lib/4-card/EmptyState';
import {ContextPaneHeader} from '../../../components/ContextPaneHeader';
import {useToolbarPlugin} from '../context';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {CollaborativeInput} from '../../../components/CollaborativeInput';
import {Input} from '../../../components/Input';
import {useSyncStore} from '../../../web/react/hooks';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {UrlDisplayCard} from '../cards/UrlDisplayCard';
import {rule} from 'nano-theme';
import {parseUrl} from '../../../web/util';
import type {SliceConfigState} from '../state/types';

const headerClass = rule({
  fz: '14px',
  us: 'none',
  pdb: '8px',
});

const iconClass = rule({
  transform: 'scale(.8)',
  fz: '14px',
  w: '28px',
  h: '28px',
  bdrad: '6px',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bg: 'rgba(0,0,0,.1)',
  o: .7,
  mr: '0 6px 0 4px',
});

export interface NewLinkConfigProps {
  config: SliceConfigState<any>;
  onSave: () => void;
}

export const NewLinkConfig: React.FC<NewLinkConfigProps> = ({config, onSave}) => {
  const {toolbar} = useToolbarPlugin();
  const inpRef = React.useRef<HTMLInputElement | null>(null);
  const api = config.conf();
  const href = React.useMemo(() => () => config.conf().str(['href']), [config]);
  // const title = React.useMemo(() => () => config.conf().str(['title']), [config]);
  const hrefView = useSyncStore(href().events);
  const parsed = React.useMemo(() => parseUrl(hrefView), [hrefView]);

  const icon = config.menu?.icon?.();
  const name = config.menu?.name ?? config.def.name;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}>
      <ContextPaneHeader onCloseClick={() => toolbar.newSliceConfig.next(void 0)}>
        <div className={headerClass}>
          {icon ? (
            <Flex style={{alignItems: 'center'}}>
              <div className={iconClass}>
                {icon}
              </div>
              {name}
            </Flex>
          ) : (
            name
          )}
        </div>
      </ContextPaneHeader>

      <div style={{background: '#fff', borderRadius: '8px 8px 0 0', margin: '-8px 0 -8px', width: '100%', height: '8px'}} />

      <div style={{padding: '16px'}}>
        <CollaborativeInput str={href} input={(ref) => (
          <Input focus
            inp={(el) => {
              ref(el);
              inpRef.current = el;
            }}
            type={'text'}
            size={-1}
            placeholder={'https://'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSave();
              }
            }}
            right={(
              <div style={{paddingRight: 8, width: 24, height: 24}}>
                {!!hrefView && <BasicButtonClose onClick={() => {
                  href().del(0, href().length());
                  inpRef.current?.focus();
                }} />}
              </div>
            )}
          />
        )} />
      </div>

      <ContextSep line />
      <ContextSep />
      <ContextTitle>Preview</ContextTitle>

      {hrefView ? (
        <div style={{display: 'flex', padding: '14px 32px 26px', alignItems: 'center', justifyContent: 'center'}}>
          <UrlDisplayCard url={hrefView} />
        </div>
      ) : (
        <div style={{margin: '-22px 0 -8px'}}>
          <EmptyState emoji=' ' title=' ' />
        </div>
      )}

      <ContextSep line />
      
      <div style={{padding: '16px'}}>
        <Button small lite={!hrefView} positive={!!parsed} block disabled={!hrefView} submit>Save</Button>
      </div>
    </form>
  );
};
