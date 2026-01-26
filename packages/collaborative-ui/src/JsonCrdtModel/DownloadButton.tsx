import * as React from 'react';
import {useT} from 'use-t';
import type {Model} from 'json-joy/lib/json-crdt';
import {encode as encodeCbor} from '@jsonjoy.com/json-pack/lib/cbor/shared';
import {Encoder as VerboseEncoder} from 'json-joy/lib/json-crdt/codec/structural/verbose/Encoder';
import {Encoder as CompactEncoder} from 'json-joy/lib/json-crdt/codec/structural/compact/Encoder';
import {Encoder as IndexedEncoder} from 'json-joy/lib/json-crdt/codec/indexed/binary/Encoder';
import {Encoder as SidecarEncoder} from 'json-joy/lib/json-crdt/codec/sidecar/binary/Encoder';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {ContextItem, ContextSep, ContextPane, ContextTitle} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {DownloadIcon} from '../icons/DownloadIcon';
import {downloadBlob} from '../util/downloadBlob';

const ExternalLinkIcon = makeIcon({set: 'auth0', icon: 'external-link'});

export interface DownloadButtonProps {
  model: Model<any>;
  filename?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({model, filename = 'model'}) => {
  const [t] = useT();

  return (
    <Popup
      renderContext={() => (
        <ContextPane minWidth={240}>
          <ContextSep />
          <ContextTitle>{t('Structural')}</ContextTitle>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const uint8 = model.toBinary();
              const blob = new Blob([uint8 as BlobPart], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + '.crdt');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  binary
                </Code>
              </span>
              <Sidetip small>{'.crdt'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const uint8 = encodeCbor(new VerboseEncoder().encode(model));
              const blob = new Blob([uint8 as BlobPart], {type: 'application/cbor'});
              downloadBlob(blob, filename + '.cbor');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  verbose
                </Code>
              </span>
              <Sidetip small>{'.cbor'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const json = JSON.stringify(new VerboseEncoder().encode(model), null, 2);
              const blob = new Blob([json], {type: 'application/json'});
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

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const uint8 = encodeCbor(new CompactEncoder().encode(model));
              const blob = new Blob([uint8 as BlobPart], {type: 'application/cbor'});
              downloadBlob(blob, filename + '.cbor');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  compact
                </Code>
              </span>
              <Sidetip small>{'.cbor'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const json = JSON.stringify(new CompactEncoder().encode(model), null, 2);
              const blob = new Blob([json], {type: 'application/json'});
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

          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextTitle>{t('Indexed')}</ContextTitle>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const uint8 = encodeCbor(new IndexedEncoder().encode(model));
              const blob = new Blob([uint8 as BlobPart], {type: 'application/cbor'});
              downloadBlob(blob, filename + ' - indexed.cbor');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  binary
                </Code>
              </span>
              <Sidetip small>{'.cbor'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextTitle>{t('Sidecar')}</ContextTitle>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const [, sidecar] = new SidecarEncoder().encode(model);
              const uint8 = encodeCbor(sidecar);
              const blob = new Blob([uint8.slice()], {type: 'application/octet-stream'});
              downloadBlob(blob, filename + ' - sidecar.crdt');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  binary
                </Code>
              </span>
              <Sidetip small>{'.crdt'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextItem
            closePopup
            inset
            onClick={() => {
              window.open('https://jsonjoy.com/specs/json-crdt/encoding', '_blank');
            }}
            icon={<ExternalLinkIcon width={16} height={16} />}
          >
            {t('About encoding formats')}
            {' …'}
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
