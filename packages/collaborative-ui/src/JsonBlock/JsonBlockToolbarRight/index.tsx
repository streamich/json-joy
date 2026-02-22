import * as React from 'react';
import {useT} from 'use-t';
import {encode} from '@jsonjoy.com/json-pack/lib/cbor/shared';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {ContextItem, ContextSep, ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {CopyButton} from '../../CopyButton';
import {select} from '../../util/select';
import {DownloadIcon} from '../../icons/DownloadIcon';
import {downloadBlob} from '../../util/downloadBlob';
import type {JsonBlockState} from '../JsonBlockState';

export interface JsonBlockToolbarRightProps {
  value: unknown;
  filename?: string;
  state: JsonBlockState;
  compact?: boolean;
}

export const JsonBlockToolbarRight: React.FC<JsonBlockToolbarRightProps> = ({
  value,
  filename = 'file',
  compact,
  state,
}) => {
  const [t] = useT();
  const view = useBehaviorSubject(state.view$);
  const path = useBehaviorSubject(state.path$);

  const handleCopy = () => JSON.stringify(select(value, path), null, view === 'minified' ? 0 : 2);

  const downloadIcon = (
    <BasicTooltip renderTooltip={() => t('Download')}>
      <Popup
        renderContext={() => (
          <ContextPane minWidth={220}>
            <ContextSep />
            <ContextItem
              closePopup
              inset
              icon={<DownloadIcon />}
              onClick={() => {
                const json = JSON.stringify(value, null, 2);
                const blob = new Blob([json], {type: 'application/json'});
                downloadBlob(blob, filename + '.json');
              }}
            >
              <Split>
                <span>{t('Download JSON')}</span>
                <Sidetip small>{'.json'}</Sidetip>
              </Split>
            </ContextItem>
            <ContextItem
              closePopup
              inset
              icon={<DownloadIcon />}
              onClick={() => {
                const uint8 = encode(value);
                const blob = new Blob([uint8 as BlobPart], {type: 'application/cbor'});
                downloadBlob(blob, filename + '.cbor');
              }}
            >
              <Split>
                <span>{t('Download CBOR')}</span>
                <Sidetip small>{'.cbor'}</Sidetip>
              </Split>
            </ContextItem>
            <ContextSep />
          </ContextPane>
        )}
      >
        <BasicButton>
          <DownloadIcon />
        </BasicButton>
      </Popup>
    </BasicTooltip>
  );

  return (
    <div>
      <Flex>
        {!compact && (
          <>
            <BasicTooltip renderTooltip={() => t('Copy')}>
              <CopyButton onCopy={handleCopy} />
            </BasicTooltip>
            <Space horizontal size={-2} />
          </>
        )}
        {downloadIcon}
      </Flex>
    </div>
  );
};
