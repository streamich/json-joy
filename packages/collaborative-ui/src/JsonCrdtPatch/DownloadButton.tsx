import * as React from 'react';
import {useT} from 'use-t';
import type {Patch} from 'json-joy/lib/json-crdt';
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
import {encode as encodeCbor} from '@jsonjoy.com/json-pack/lib/cbor/shared';
import {encode as encodeVerbose} from 'json-joy/lib/json-crdt-patch/codec/verbose/encode';
import {encode as encodeCompact} from 'json-joy/lib/json-crdt-patch/codec/compact/encode';

const ExternalLinkIcon = makeIcon({set: 'auth0', icon: 'external-link'});

export interface DownloadButtonProps {
  patch: Patch;
  filename?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({patch, filename = 'patch'}) => {
  const [t] = useT();

  const id = patch.getId();
  const idFormatted = id?.sid + '-' + id?.time;
  const name = filename + ' - ' + idFormatted;

  return (
    <Popup
      renderContext={() => (
        <ContextPane minWidth={260}>
          <ContextSep />
          <ContextTitle>{t('Structural')}</ContextTitle>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const uint8 = patch.toBinary();
              const blob = new Blob([uint8 as BlobPart], {type: 'application/octet-stream'});
              downloadBlob(blob, name + '.crdt.patch');
            }}
          >
            <Split>
              <span>
                {t('Download')}{' '}
                <Code gray size={0} spacious>
                  binary
                </Code>
              </span>
              <Sidetip small>{'.crdt.patch'}</Sidetip>
            </Split>
          </ContextItem>

          <ContextItem
            closePopup
            inset
            icon={<DownloadIcon />}
            onClick={() => {
              const json = JSON.stringify(encodeVerbose(patch), null, 2);
              const blob = new Blob([json], {type: 'application/json'});
              downloadBlob(blob, name + '.json');
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
              const uint8 = encodeCbor(encodeVerbose(patch));
              const blob = new Blob([uint8 as BlobPart], {type: 'application/cbor'});
              downloadBlob(blob, name + '.cbor');
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
              const json = JSON.stringify(encodeCompact(patch), null, 2);
              const blob = new Blob([json], {type: 'application/json'});
              downloadBlob(blob, name + '.json');
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
            onClick={() => {
              const uint8 = encodeCbor(encodeCompact(patch));
              const blob = new Blob([uint8 as BlobPart], {type: 'application/cbor'});
              downloadBlob(blob, name + '.cbor');
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

          <ContextSep />
          <ContextSep line />
          <ContextSep />

          <ContextItem
            closePopup
            inset
            onClick={() => {
              window.open('https://jsonjoy.com/specs/json-crdt-patch/encoding', '_blank');
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
