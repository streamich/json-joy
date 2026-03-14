import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {convertLatexToMarkup} from 'mathlive';
import {CopyButton} from '../../../../components/CopyButton';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useT} from 'use-t';
import type {ViewProps} from '../../../InlineSliceBehavior';

// TODO: load these once?
// import 'mathlive/fonts.css';
// import 'mathlive/static.css';

const EditIcon = makeIcon({set: 'lucide', icon: 'pencil'});

const wrapClass = rule({
  pd: '4px 0',
});

const renderedClass = drule({
  fz: '1.1em',
  lineHeight: '1.6',
  overflowX: 'auto',
  pd: '8px 0',
  '& .ML__latex': {
    display: 'inline',
  },
});

const sourceClass = drule({
  fz: '.8em',
  op: 0.5,
  fontFamily: 'monospace',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  pd: '4px 0',
});

const actionsClass = rule({
  d: 'flex',
  gap: '4px',
  pd: '6px 0 0',
  jc: 'flex-end',
});

export const View: React.FC<ViewProps> = ({formatting, onEdit}) => {
  const [t] = useT();
  const tex = (formatting.range as unknown as {text(): string}).text?.() ?? '';

  const html = React.useMemo(() => convertLatexToMarkup(tex || '\\placeholder{}'), [tex]);

  return (
    <div className={wrapClass}>
      <div
        className={renderedClass({})}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: mathlive produces safe sanitized HTML
        dangerouslySetInnerHTML={{__html: html}}
      />
      {tex && (
        <div className={sourceClass({})}>
          {tex}
        </div>
      )}
      <div className={actionsClass}>
        {tex && (
          <CopyButton size={-1} onCopy={() => tex}>
            {t('Copy')}
          </CopyButton>
        )}
        <BasicButton size={-1} onClick={onEdit}>
          <EditIcon width={13} height={13} />
          &ensp;{t('Edit')}
        </BasicButton>
      </div>
    </div>
  );
};
