import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import useDropArea from 'react-use/lib/useDropArea';
import {drule, rule, useTheme} from 'nano-theme';
import {useT} from 'use-t';
import {useExplorer} from '../context';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';

const css = {
  block: rule({
    bxz: 'border-box',
    pd: '8px',
  }),
  area: drule({
    d: 'flex',
    jc: 'center',
    ai: 'center',
    bdrad: '8px',
    cur: 'pointer',
  }),
};

export type DropAreaProps = Record<string, never>;

export const DropArea: React.FC<DropAreaProps> = () => {
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);
  const theme = useTheme();
  const [t] = useT();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [bond, area] = useDropArea({
    onFiles: (files) => state.addFiles(files),
    onUri: (uri) => console.log('uri', uri),
    onText: (text) => console.log('text', text),
  });

  return (
    <Paper className={css.block} round contrast>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: click triggers file input, keyboard accessible via the input itself */}
      <div
        {...bond}
        className={css.area({
          pd: `${files.length ? 16 : 110}px 8px`,
          bd: area.over ? `1px dashed ${theme.color.sem.blue[0]}` : `1px dashed ${theme.g(0.94)}`,
          bg: area.over ? 'rgba(0,128,255,.04)' : theme.g(1),
          '&:hover': {
            bd: `1px dashed ${theme.color.sem.blue[0]}`,
            bg: 'rgba(0,128,255,.04)',
            '& > span': {
              col: theme.color.sem.blue[0],
            },
          },
        })}
        onClick={() => inputRef.current?.click()}
      >
        <Text font={'ui3'} size={-1} style={{pointerEvents: 'none'}}>
          {t('Click or drop files here')}
        </Text>
      </div>
      <input
        multiple
        type="file"
        ref={inputRef}
        style={{display: 'none'}}
        onChange={() => {
          const input = inputRef.current;
          if (!input) return;
          const files = input.files;
          if (files) state.addFiles(Array.from(files));
        }}
      />
    </Paper>
  );
};
