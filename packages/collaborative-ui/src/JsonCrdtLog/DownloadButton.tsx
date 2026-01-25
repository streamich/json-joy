import * as React from 'react';
import {useT} from 'use-t';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {ContextItem, ContextSep, ContextPane, ContextTitle} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {LogEncoder} from 'json-joy/lib/json-crdt/log/codec/LogEncoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {DownloadIcon} from '../icons/DownloadIcon';
import {useLogState} from './context';
import {downloadBlob} from '../util/downloadBlob';
import {gzip} from '@jsonjoy.com/util/lib/compression/gzip';

export interface DownloadButtonProps {
  filename?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({filename = 'log'}) => {
  const [t] = useT();
  const state = useLogState();

  return (
    <Popup
      renderContext={() => (
        <ContextPane minWidth={260}>
          <ContextSep />
          <ContextTitle>{t('Full history')}</ContextTitle>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={async () => {
              const cborEncoder = new CborEncoder();
              const encoder = new LogEncoder({cborEncoder});
              const encoded = encoder.encode(state.log, {
                format: 'seq.cbor',
                history: 'binary',
                model: 'none',
                noView: true,
              });
              const compressed = await gzip(encoded);
              const blob = new Blob([compressed.slice()], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + '.seq.cbor.gz');
            }}
          >
            <Split>
              <span>{t('Download')}</span>
              <Sidetip small>{'.seq.cbor.gz'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextSep />
        </ContextPane>
      )}
    >
      <BasicTooltip nowrap renderTooltip={() => t('Download')}>
        <BasicButton>
          <DownloadIcon />
        </BasicButton>
      </BasicTooltip>
    </Popup>
  );
};
