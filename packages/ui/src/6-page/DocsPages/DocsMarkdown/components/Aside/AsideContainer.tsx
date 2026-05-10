import * as React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import {drule, rule} from 'nano-theme';
import {useStyles} from '../../../../../styles/context';
import {useDocsMarkdownCtx} from '../../context';
import AsideInline from './AsideInline';
import {NiceUiSizes} from '../../../../../constants';

const blockClass = rule({
  pos: 'relative',
  h: 0,
  pad: 0,
  mar: 0,
  lh: 0,
});

const innerBlockClass = drule({
  pos: 'absolute',
  top: 0,
  left: '100%',
  pad: '4px 0 0',
  fz: '0.83em',
  lh: '1.42em',
  bxz: 'border-box',
});

export interface Props {
  children: React.ReactNode;
  left?: boolean;
}

const AsideContainer: React.FC<Props> = ({children, left}) => {
  const wndSize = useWindowSize();
  const {contentWidth} = useDocsMarkdownCtx();
  const styles = useStyles();
  const innerBlockCls = innerBlockClass({
    '& a': {
      col: styles.g(0.4),
      bdb: `1px solid ${styles.g(0.26, 0.2)}`,
    },
  });

  const isSmallWidth = wndSize.width <= NiceUiSizes.BlogContentMaxWidth + 100;

  if (isSmallWidth) return <AsideInline>{children}</AsideInline>;

  let inner: React.ReactNode = null;

  if (wndSize.width > NiceUiSizes.BlogContentMaxWidth + 100) {
    const marginWidth = (wndSize.width - (contentWidth || NiceUiSizes.BlogContentMaxWidth)) / 2;
    if (marginWidth < 200) return <AsideInline>{children}</AsideInline>;
    const width = Math.min(400, marginWidth - 32);
    if (width < 200) return <AsideInline>{children}</AsideInline>;
    const paddingLeft = width > 360 ? 96 : 24;
    const style: React.CSSProperties = {width, paddingLeft};
    if (left) {
      style.left = -width;
      style.paddingLeft = 0;
      style.paddingRight = paddingLeft;
    }
    inner = (
      <div className={innerBlockCls} style={style}>
        {children}
      </div>
    );
  }

  return <div className={'invisible' + blockClass}>{inner}</div>;
};

export default AsideContainer;
