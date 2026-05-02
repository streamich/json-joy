import * as React from 'react';
import {useT} from 'use-t';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {ContextItem, ContextSep, ContextPane, ContextTitle} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {LogEncoder} from 'json-joy/lib/json-crdt/log/codec/LogEncoder';
import {Patch, Batch} from 'json-joy/lib/json-crdt-patch';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {encode as encodeCbor} from '@jsonjoy.com/json-pack/lib/cbor/shared';
import {DownloadIcon} from '../icons/DownloadIcon';
import {useLogState} from './context';
import {downloadBlob} from '../util/downloadBlob';
import {gzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';

export interface DownloadButtonProps {
  filename?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({filename = 'log'}) => {
  const [t] = useT();
  const state = useLogState();

  const getPatches = (): Patch[] => {
    const patches: Patch[] = [];
    for (const {v} of state.log.patches.entries()) patches.push(v);
    return patches;
  };

  const getBatch = (): Batch => new Batch(getPatches());

  return (
    <Popup
      renderContext={() => (
        <ContextPane minWidth={320}>
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
          <ContextSep line />
          <ContextSep />

          <ContextTitle>
            {t('Batch')} ({t('columnar')})
          </ContextTitle>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={async () => {
              const {Encoder} = await import('json-joy/lib/json-crdt-patch/batch/codec/binary/Encoder');
              const encoder = new Encoder();
              const batch = getBatch();
              const u8 = encoder.encodeBatch(batch);
              const compressed = await gzip(u8);
              const blob = new Blob([compressed.slice()], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + '.col.gz');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  binary
                </Code>
              </span>
              <Sidetip small>{'.col.gz'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={async () => {
              const {encode} = await import('json-joy/lib/json-crdt-patch/batch/codec/compact/encode');
              const batch = getBatch();
              const pojo = encode(batch);
              const blob = new Blob([JSON.stringify(pojo)], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + '.col.json');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  compact
                </Code>
              </span>
              <Sidetip small>{'.col.json'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={async () => {
              const {encode} = await import('json-joy/lib/json-crdt-patch/batch/codec/verbose/encode');
              const batch = getBatch();
              const pojo = encode(batch);
              const blob = new Blob([JSON.stringify(pojo)], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + '.col.json');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  verbose
                </Code>
              </span>
              <Sidetip small>{'.col.json'}</Sidetip>
            </Split>
          </ContextItem>
          <ContextSep />
          <ContextSep line />
          <ContextSep />

          <ContextTitle>
            {t('Batch')} ({t('patch list')})
          </ContextTitle>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={async () => {
              const patches = getPatches();
              const u8 = encodeCbor(patches.map((patch) => patch.toBinary()));
              const compressed = await gzip(u8);
              const blob = new Blob([compressed.slice()], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + '.gz');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  binary
                </Code>
              </span>
              <Sidetip small>{'.gz'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={async () => {
              const {encode} = await import('json-joy/lib/json-crdt-patch/codec/compact/encode');
              const pojo = getPatches().map((patch) => encode(patch));
              const blob = new Blob([JSON.stringify(pojo)], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + '.json');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  compact
                </Code>
              </span>
              <Sidetip small>{'.json'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={async () => {
              const {encode} = await import('json-joy/lib/json-crdt-patch/codec/verbose/encode');
              const pojo = getPatches().map((patch) => encode(patch));
              const blob = new Blob([JSON.stringify(pojo)], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + '.json');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  verbose
                </Code>
              </span>
              <Sidetip small>{'.json'}</Sidetip>
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
