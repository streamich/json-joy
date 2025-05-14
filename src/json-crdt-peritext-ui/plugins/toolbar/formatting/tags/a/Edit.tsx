import * as React from 'react';
import {ContextTitle} from 'nice-ui/lib/4-card/ContextMenu/ContextTitle';
import {EmptyState} from 'nice-ui/lib/4-card/EmptyState';
import {CollaborativeInput} from '../../../../../components/CollaborativeInput';
import {Input} from '../../../../../components/Input';
import {useSyncStoreOpt} from '../../../../../web/react/hooks';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {UrlDisplayCard} from '../../../cards/UrlDisplayCard';
import type {EditableFormatting} from '../../../state/formattings';
import type {CollaborativeStr} from 'collaborative-editor';

export interface EditProps {
  formatting: EditableFormatting;
  onSave: () => void;
}

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const inpRef = React.useRef<HTMLInputElement | null>(null);
  const href = React.useMemo(() => () => formatting.conf()?.str(['href']), [formatting]);
  const hrefView = useSyncStoreOpt(href()?.events) || '';

  if (!href()) return null;

  const str = href as () => CollaborativeStr;

  return (
    <div style={{margin: -16}}>
      <div style={{padding: 16}}>
        <CollaborativeInput
          str={str}
          input={(ref) => (
            <Input
              focus
              select
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
              right={
                <div style={{paddingRight: 8, width: 24, height: 24}}>
                  {!!hrefView && (
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
      </div>

      <ContextSep line />
      <ContextSep />
      <ContextTitle>Preview</ContextTitle>

      {!!hrefView && hrefView.length > 3 ? (
        <div style={{display: 'flex', padding: '14px 32px 26px', alignItems: 'center', justifyContent: 'center'}}>
          <UrlDisplayCard url={hrefView} />
        </div>
      ) : (
        <div style={{margin: '-32px 0 -26px'}}>
          <EmptyState emoji=" " title=" " />
        </div>
      )}
    </div>
  );
};
