import * as React from 'react';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {ContextTitle} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ContextTitle';
import {EmptyState} from '@jsonjoy.com/ui/lib/4-card/EmptyState';
import {ContextSep} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {UrlDisplayCard} from '../../../cards/UrlDisplayCard';
import {useT} from 'use-t';
import {useSyncStoreOpt} from '../../../../PeritextWebUi/react/hooks';
import {CollaborativeInput} from 'collaborative-input/lib/CollaborativeInput';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import type {EditableFormatting} from '../../../state/formattings';
import type {CollaborativeStr} from 'collaborative-editor';

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

  const url = (
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
          label={t('Link')}
          placeholder={'https://'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSave();
            }
          }}
          right={(
            <div style={{visibility: data.href ? 'visible' : 'hidden'}}>
              <BasicButtonClose
                onClick={() => {
                  const hrefApi = href();
                  if (hrefApi) hrefApi.del(0, hrefApi.length());
                  inpRef.current?.focus();
                }}
              />
            </div>
          )}
        />
      )}
    />
  );

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
              label={t('Title')}
              onEsc={(e) => {
                e.preventDefault();
                e.stopPropagation();
                formatting.conf()!.replace('/title', '');
                setShowTitle(false);
              }}
              right={data.href && (
                <div style={{margin: '-2px 0'}}>
                  <BasicButtonClose
                    onClick={() => {
                      formatting.conf()!.replace('/title', '');
                      setShowTitle(false);
                    }}
                  />
                </div>
              )}
            />
          )}
        />
      ) : !data.href ? null : (
        <BasicButton
          width={'auto'}
          rounder
          fill
          compact
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
          {t('Add title')}
        </BasicButton>
      )}
    </div>
  );

  return (
    <div style={{margin: -16}}>
      <div style={{padding: 16, boxSizing: 'border-box', width: 'calc(min(500px,100vw))'}}>
        {url}
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
