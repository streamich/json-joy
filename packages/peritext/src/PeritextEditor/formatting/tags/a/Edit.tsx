import * as React from 'react';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {ContextTitle} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ContextTitle';
import {EmptyState} from '@jsonjoy.com/ui/lib/4-card/EmptyState';
import {ContextSep} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {UrlDisplayCard} from '../../../cards/UrlDisplayCard';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useT} from 'use-t';
import {useSyncStoreOpt} from '../../../../PeritextWebUi/react/hooks';
import {CollaborativeInput} from 'collaborative-input/lib/CollaborativeInput';
import {Input} from '../../../components/Input';
import type {EditableFormatting} from '../../../state/formattings';
import type {CollaborativeStr} from 'collaborative-editor';

const PlusIcon = makeIcon({set: 'lucide', icon: 'plus'});

type Data = {href: string; title?: string};

export interface EditProps {
  formatting: EditableFormatting;
  onSave: () => void;
}

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const [t] = useT();
  const inpRef = React.useRef<HTMLInputElement | null>(null);
  const titleRef = React.useRef<HTMLInputElement | null>(null);
  const [showTitle, setShowTitle] = React.useState(!!formatting.conf()?.view()?.title);
  const href = React.useMemo(() => () => formatting.conf()?.str(['href']), [formatting]);
  const titleStr = React.useMemo(() => () => formatting.conf()?.str(['title']), [formatting]);
  const data: Data = (useSyncStoreOpt(formatting.conf()!.events) as Data) || {url: ''};

  if (!href()) return null;

  const str = href as () => CollaborativeStr;

  const title = (
    <div style={{padding: '8px 0 0'}}>
      {showTitle ? (
        <CollaborativeInput
          str={titleStr as () => CollaborativeStr}
          input={(connect) => (
            <Input
              inp={(el) => {
                connect(el);
                titleRef.current = el;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSave();
                }
              }}
              type={'text'}
              size={-1}
              placeholder={t('Title')}
            />
          )}
        />
      ) : !data.href ? null : (
        <Button
          icon={<PlusIcon width={16} height={16} />}
          size={-1}
          outline
          ghost
          radius={1}
          style={{borderStyle: 'dashed'}}
          onClick={() => {
            if (typeof formatting.conf()?.view()?.title !== 'string') {
              formatting.conf()!.set({title: ''});
            }
            setShowTitle(true);
            setTimeout(() => {
              titleRef.current?.focus();
            }, 20);
          }}
        >
          {t('Title')}
        </Button>
      )}
    </div>
  );

  return (
    <div style={{margin: -16}}>
      <div style={{padding: 16}}>
        <CollaborativeInput
          str={str}
          input={(ref) => (
            <Input
              focus
              select
              inp={(connect) => {
                ref(connect);
                inpRef.current = connect;
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
              right={
                <div style={{paddingRight: 8, width: 24, height: 24}}>
                  {!!data.href && (
                    <BasicButtonClose
                      onClick={() => {
                        const hrefApi = href();
                        if (hrefApi) hrefApi.del(0, hrefApi.length());
                        inpRef.current?.focus();
                      }}
                    />
                  )}
                </div>
              }
            />
          )}
        />
        {title}
      </div>

      <ContextSep line />
      <ContextSep />
      <ContextTitle>Preview</ContextTitle>

      {!!data && data.href.length > 3 ? (
        <div style={{display: 'flex', padding: '14px 32px 26px', alignItems: 'center', justifyContent: 'center'}}>
          <UrlDisplayCard url={data.href} title={data.title} />
        </div>
      ) : (
        <div style={{margin: '-32px 0 -26px'}}>
          <EmptyState emoji=" " title=" " />
        </div>
      )}
    </div>
  );
};
