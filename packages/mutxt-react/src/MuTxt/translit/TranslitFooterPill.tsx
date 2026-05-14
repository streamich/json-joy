import * as React from 'react';
import {rule} from 'nano-theme';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useMuTxt} from '../context';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {formatKeys} from '../util/keys';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';

const wrapClass = rule({
  d: 'inline-flex',
  ai: 'center',
});

export const TranslitFooterPill: React.FC = () => {
  const mutxt = useMuTxt();
  const activeId = mutxt.translit.active.use();

  if (!activeId) return null;
  const scheme = mutxt.translit.schemes.get(activeId);
  if (!scheme) return null;
  const short = scheme.short ?? scheme.language.toUpperCase();

  return (
    <span className={wrapClass}>
      <BasicTooltip
        nowrap
        aria-label={`${scheme.name} (click to disable)`}
        renderTooltip={() => `${scheme.name} (click to disable)`}
        shortcut={formatKeys(['Primary', 'Alt', 't'])}
      >
        <BasicButton
          width="auto"
          compact
          onClick={(event) => {
            event.preventDefault();
            mutxt.translit.off();
          }}
        >
          <Iconista set="fontawesome_regular" icon="keyboard" width={16} height={16} />
          <Space horizontal size={-3} />
          {short}
        </BasicButton>
      </BasicTooltip>

      <BasicTooltip
        nowrap
        aria-label="Show phonetic map"
        renderTooltip={() => 'Show phonetic map'}
        shortcut={formatKeys(['Primary', 'Alt', 'Shift', 't'])}
      >
        <BasicButton
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={(event) => {
            event.preventDefault();
            mutxt.translit.openMap();
          }}
        >
          <Iconista set="tabler" icon="map" width={16} height={16} />
        </BasicButton>
      </BasicTooltip>

      <Space horizontal size={-2} />
      {/* <Separator style={{width: 1, height: 16}}  /> */}
      <Separator style={{width: 1, height: 48}} />
    </span>
  );
};
