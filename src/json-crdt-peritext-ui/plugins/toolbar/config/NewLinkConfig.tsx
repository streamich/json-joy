import * as React from 'react';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {ContextTitle} from 'nice-ui/lib/4-card/ContextMenu/ContextTitle';
import {EmptyState} from 'nice-ui/lib/4-card/EmptyState';
import {ContextPaneHeader} from '../../../components/ContextPaneHeader';
import {useToolbarPlugin} from '../context';
import {CollaborativeInput} from '../../../components/CollaborativeInput';
import {Input} from '../../../components/Input';
import {useSyncStore} from '../../../web/react/hooks';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {UrlDisplayCard} from '../cards/UrlDisplayCard';
import {rule} from 'nano-theme';
import {parseUrl} from '../../../web/util';
import {ContextPaneHeaderSep} from '../../../components/ContextPaneHeaderSep';
import {useStyles} from 'nice-ui/lib/styles/context';
import {FormattingTitle} from '../components/FormattingTitle';
import type {NewFormatting} from '../state/formattings';

const blockClass = rule({
  maxW: '600px',
});

const headerClass = rule({
  d: 'flex',
  ai: 'center',
  fz: '14px',
  us: 'none',
});

const iconClass = rule({
  fz: '14px',
  w: '28px',
  h: '28px',
  bdrad: '6px',
  pd: '0',
  mr: '0 8px 0 0',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bg: 'rgba(0,0,0,.08)',
  o: .7,
  '&>div': {
    transform: 'scale(.9)',
    transformOrigin: 'center',
    d: 'flex',
    ai: 'center',
    jc: 'center',
  },
});

export interface NewLinkConfigProps {
  formatting: NewFormatting;
  onSave: () => void;
}

export const NewLinkConfig: React.FC<NewLinkConfigProps> = ({formatting, onSave}) => {
  const styles = useStyles();
  const {toolbar} = useToolbarPlugin();
  const inpRef = React.useRef<HTMLInputElement | null>(null);
  const api = formatting.conf();
  const href = React.useMemo(() => () => formatting.conf().str(['href']), [formatting]);
  const hrefView = useSyncStore(href().events);
  const parsed = React.useMemo(() => parseUrl(hrefView), [hrefView]);

  return (
    <form className={blockClass} onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}>
      <ContextPaneHeader short onCloseClick={() => toolbar.newSlice.next(void 0)}>
        <FormattingTitle formatting={formatting} />
      </ContextPaneHeader>
      <ContextPaneHeaderSep />

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
