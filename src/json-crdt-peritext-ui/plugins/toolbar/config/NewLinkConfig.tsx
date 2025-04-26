import * as React from 'react';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {ContextTitle} from 'nice-ui/lib/4-card/ContextMenu/ContextTitle';
import {EmptyState} from 'nice-ui/lib/4-card/EmptyState';
import {ContextPaneHeader} from '../../../components/ContextPaneHeader';
import {useToolbarPlugin} from '../context';
import {CollaborativeInput} from '../../../components/CollaborativeInput';
import {Input} from '../../../components/Input';
import {useSyncStoreOpt} from '../../../web/react/hooks';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {UrlDisplayCard} from '../cards/UrlDisplayCard';
import {rule} from 'nano-theme';
import {parseUrl} from '../../../web/util';
import {ContextPaneHeaderSep} from '../../../components/ContextPaneHeaderSep';
import {FormattingTitle} from '../components/FormattingTitle';
import {NewProps} from '../types';
import type {CollaborativeStr} from 'collaborative-editor';

const blockClass = rule({
  maxW: '600px',
});

export const NewLinkConfig: React.FC<NewProps> = ({formatting}) => {
  const {toolbar} = useToolbarPlugin();
  const inpRef = React.useRef<HTMLInputElement | null>(null);
  const href = React.useMemo(() => () => formatting.conf()?.str(['href']), [formatting]);
  const hrefView = useSyncStoreOpt(href()?.events) || '';
  const parsed = React.useMemo(() => parseUrl(hrefView), [hrefView]);

  if (!href()) return null;

  const str = href as (() => CollaborativeStr);

  return (
    <form className={blockClass} onSubmit={(e) => {
      e.preventDefault();
      formatting.save();
    }}>
      <ContextPaneHeader short onCloseClick={() => toolbar.newSlice.next(void 0)}>
        <FormattingTitle formatting={formatting} />
      </ContextPaneHeader>
      <ContextPaneHeaderSep />

      <div style={{padding: '16px'}}>
        <CollaborativeInput str={str} input={(ref) => (
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
                formatting.save();
              }
            }}
            right={(
              <div style={{paddingRight: 8, width: 24, height: 24}}>
                {!!hrefView && <BasicButtonClose onClick={() => {
                  const hrefApi = href();
                  if (hrefApi) hrefApi.del(0, hrefApi.length());
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

      {!!hrefView && (hrefView.length > 3) ? (
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
