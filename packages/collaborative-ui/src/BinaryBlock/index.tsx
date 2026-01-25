import * as React from 'react';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {CopyButton} from '../CopyButton';
import {rule, useTheme} from 'nano-theme';
import {CodeblockLayout} from '../CodeblockLayout';
import {useT} from 'use-t';

const liteClass = rule({
  op: 0.25,
});

const css = {
  block: rule({
    pos: 'relative',
    pd: 0,
    mr: 0,
    pre: {
      mr: 0,
      fz: '12px',
    },
  }),
  size: rule({
    fz: '12px',
    pos: 'absolute',
    b: '8px',
    r: '12px',
    us: 'none',
    pe: 'none',
  }),
};

export interface BinaryBlockProps {
  uint8: Uint8Array;
  header?: React.ReactNode;
  compact?: boolean;
}

export const BinaryBlock: React.FC<BinaryBlockProps> = ({uint8, header, compact}) => {
  const [t] = useT();
  const theme = useTheme();
  const ascii = true;
  const octets = React.useMemo(() => {
    const nodes: React.ReactNode[] = [];
    const length = uint8.length;
    for (let i = 0; i < length; i++) {
      const octet = uint8[i];
      if (ascii && octet >= 32 && octet <= 126) {
        nodes.push(' ' + String.fromCharCode(octet));
      } else {
        const node = octet < 16 ? '0' + octet.toString(16) : octet.toString(16);
        if (ascii) {
          nodes.push(<span className={liteClass}>{node}</span>);
        } else {
          nodes.push(node);
        }
      }
      nodes.push(
        (i % 8 !== 7 ? ' ' : '') + (i % 8 === 7 && i % 16 !== 15 ? '     ' : '') + (i % 16 === 15 ? '\n' : ''),
      );
    }
    return nodes;
  }, [uint8]);

  return (
    <div className={css.block}>
      <CodeblockLayout>
        <Split>
          <div>{header}</div>
          <CopyButton onCopy={() => [...uint8].map((c) => c.toString(16).padStart(2, '0')).join(' ')} />
        </Split>
        <div style={{margin: compact ? '-24px 0 -4px' : '-20px 0 0'}}>{React.createElement('pre', {}, ...octets)}</div>
      </CodeblockLayout>
      <div className={css.size} style={{color: theme.g(0, 0.3)}}>
        {uint8.length.toLocaleString()} {t('bytes')}
      </div>
    </div>
  );
};
