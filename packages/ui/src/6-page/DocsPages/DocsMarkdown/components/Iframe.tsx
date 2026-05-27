import * as React from 'react';
import {drule, rule} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import useSize from 'react-use/lib/useSize';
import {useStyles} from '../../../../styles/context';
import {NiceUiSizes} from '../../../../constants';

const blockClass = rule({
  mar: 0,
  bd: 0,
  w: '100%',
  pad: '24px 0',
  '@media (max-width: 800px)': {
    pad: '16px 0',
  },
});

const iframeClass = drule({
  mar: 0,
  pd: 0,
  bd: 0,
  w: '100%',
  bdrad: '3px',
});

export interface IframeProps {
  src: string;
  height?: number;
  wide?: boolean;
}

export const Iframe: React.FC<IframeProps> = ({src, height, wide}) => {
  const styles = useStyles();
  const iframeCls = iframeClass({
    bg: styles.g(0, 0.04),
    bxsh: `0 0 3px 0 ${styles.g(0, 0.1)}, 0 2px 5px 0 ${styles.g(0, 0.2)}`,
  });
  const inner = (
    <div className={'ff-iframe' + blockClass}>
      <iframe className={iframeCls} src={src} style={{height}} title={src} />
    </div>
  );
  if (!wide) return inner;
  return <WideFrame>{inner}</WideFrame>;
};

const WideFrame: React.FC<{children: React.ReactNode}> = ({children}) => {
  const wndSize = useWindowSize();
  const [element] = useSize((state) => {
    let width = NiceUiSizes.SiteWidth;
    width = Math.min(width, wndSize.width - 32);
    if (width < state.width) width = state.width;
    const marginLeft = width > state.width ? -((width - state.width) / 2) : 0;
    return (
      <div>
        <div style={{width, marginLeft}}>{children}</div>
      </div>
    );
  });
  return element;
};

export default Iframe;
