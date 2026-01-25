import * as React from 'react';
import {rule} from 'nano-theme';
import {useDebugCtx} from '../context';
import {ButtonGroup} from '../../../components/ButtonGroup';
import {Button} from '../../../components/Button';
import {useSyncStore} from '../../../react/hooks';

const consoleClass = rule({
  bxz: 'border-box',
  bg: '#fafafa',
  fz: '8px',
  mr: '8px 0',
  pd: '8px 16px',
  bdrad: '8px',
  lh: '1.3em',
});

// biome-ignore lint: empty interface
export type ConsoleProps = {};

export const Console: React.FC<ConsoleProps> = () => {
  const {ctx, flags} = useDebugCtx();
  const dom = useSyncStore(flags.dom);
  const editor = useSyncStore(flags.editor);
  const peritext = useSyncStore(flags.peritext);
  const model = useSyncStore(flags.model);

  if (!ctx) return null;

  return (
    <div className={consoleClass}>
      <ButtonGroup>
        <Button small active={dom} onClick={() => flags.dom.next(!dom)}>
          DOM
        </Button>
        <Button small active={editor} onClick={() => flags.editor.next(!editor)}>
          Editor
        </Button>
        <Button small active={peritext} onClick={() => flags.peritext.next(!peritext)}>
          Peritext
        </Button>
        <Button small active={model} onClick={() => flags.model.next(!model)}>
          Model
        </Button>
      </ButtonGroup>
      {!!dom && <pre>{ctx.dom + ''}</pre>}
      {!!editor && <pre>{ctx.peritext.editor + ''}</pre>}
      {!!peritext && <pre>{ctx.peritext + ''}</pre>}
      {!!model && <pre>{ctx.peritext.model + ''}</pre>}
    </div>
  );
};
