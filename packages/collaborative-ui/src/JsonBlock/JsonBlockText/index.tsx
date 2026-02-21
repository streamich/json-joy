import * as React from 'react';
import HighlightCode from '@jsonjoy.com/ui/lib/1-inline/HighlightCode';
import {encoder as cborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/shared';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {rule, theme, useTheme} from 'nano-theme';
import {select} from '../../util/select';
import {useT} from 'use-t';

const encoder = new JsonEncoder(cborEncoder.writer);

const css = {
  block: rule({
    pos: 'relative',
  }),
  text: rule({
    ...theme.font.mono.mid,
    fz: '12px',
    pd: '8px 4px 0',
    mr: 0,
    w: '100%',
    ovx: 'auto',
    bxz: 'border-box',
    code: {
      ...theme.font.mono.mid,
      fz: '12px',
    },
  }),
  size: rule({
    pos: 'absolute',
    b: '-2px',
    r: '0px',
    pd: '2px 4px',
    mr: '-2px',
    bxz: 'border-box',
    fz: '0.85em',
    bdrad: '3px',
    us: 'none',
    pe: 'none',
  }),
};

export interface JsonBlockTextProps {
  value: unknown;
  path?: string;
  plain?: boolean;
  tab?: number;
  wrap?: boolean;
}

export const JsonBlockText: React.FC<JsonBlockTextProps> = ({value, path, plain, tab = 2, wrap}) => {
  const [t] = useT();
  const theme = useTheme();
  // biome-ignore lint: manual dependency list
  const json = React.useMemo(() => {
    const selected = select(value, path);
    const encoded = new TextDecoder().decode(encoder.encode(selected));
    return tab ? JSON.stringify(JSON.parse(encoded), null, tab) : encoded;
  }, [value, path]);

  const style: React.CSSProperties = {
    color: theme.g(0.2),
    wordWrap: wrap ? 'normal' : undefined,
    width: wrap ? '100%' : undefined,
  };

  let element = plain ? <code style={style}>{json}</code> : <HighlightCode code={json} lang={'json'} />;

  if (wrap) {
    element = <div className={css.text}>{element}</div>;
  } else {
    element = <pre className={css.text}>{element}</pre>;
  }

  return (
    <div className={css.block}>
      {element}
      <div className={css.size} style={{color: theme.g(0, 0.3), background: theme.g(0.98, 0.9)}}>
        {json.length.toLocaleString()} {t('Unicode codepoints')}
      </div>
    </div>
  );
};
