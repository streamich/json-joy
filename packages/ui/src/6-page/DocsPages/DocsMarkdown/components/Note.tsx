import {drule} from 'nano-theme';
import * as React from 'react';
import type {ICode} from 'very-small-parser/lib/markdown/block/types';
import {useStyles} from '../../../../styles/context';
import {HslColor} from '../../../../styles/color/HslColor';
import {ThemeColor} from '../../../../styles/color/ThemeColor';
import DocsMd from '../DocsMd';

const ACCENT = '#07f';

const getNoteColors = (light: boolean) => {
  const hsl = HslColor.from(ACCENT)!;
  const surface = light ? HslColor.from('#fff')! : HslColor.from('#000')!;
  const themed = new ThemeColor(hsl.norm(), surface);
  return {
    accent: themed.toString(),
    bg: themed.g(0.02),
    bgHover: themed.g(0.04),
    bd: themed.col(0.16).fg.pct(0, -0.5).toString(),
    bdHover: themed.col(0.22).fg.pct(0, -0.5).toString(),
  };
};

const blockClass = drule({
  pos: 'relative',
  fz: '0.95em',
  mar: '20px 0 0 0',
  bxz: 'border-box',
  maxW: '780px',
  bdrad: '8px',
  pad: '24px 32px',
  '@media (max-width: 800px)': {pad: '16px'},
  trs: 'background-color .2s ease, border-color .2s ease',
});

const handleClass = drule({
  pos: 'absolute',
  insetInlineStart: '-3px',
  top: '8px',
  bottom: '8px',
  w: '5px',
  bdrad: '2px',
  pointerEvents: 'none',
});

export interface Props {
  node: ICode;
}

const Note: React.FC<Props> = ({node}) => {
  const styles = useStyles();
  const colors = React.useMemo(() => getNoteColors(!!styles.light), [styles.light]);
  const cls = blockClass({
    bg: colors.bg,
    bd: `1px solid ${colors.bd}`,
    '&:hover': {
      bg: colors.bgHover,
      borderColor: colors.bdHover,
    },
    svg: {
      fill: styles.g(0.4),
      col: styles.g(0.4),
    },
  });
  const handleCls = handleClass({bg: colors.accent});
  return (
    <div className={'ff-note' + cls}>
      <span aria-hidden="true" className={handleCls} />
      <DocsMd md={node.value} />
    </div>
  );
};

export default Note;
