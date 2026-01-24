import * as React from 'react';
import {drule, rule, theme} from 'nano-theme';
import {useAnchorPointHandle, anchorContext} from '../../utils/popup';
import type {AnchorPointComputeSpec} from '../../utils/popup/types';
import {useStyles} from '../../styles/context';
import {KeyLite} from '../../1-inline/KeyLite';
import {PositionPopup} from '../../utils/popup/PositionPopup';

const blockClass = drule({
  pos: 'relative',
  d: 'inline-flex',
});

const tooltipClass = rule({
  ...theme.font.ui1.mid,
  pos: 'relative',
  d: 'inline-flex',
  bgc: 'rgba(0,0,0,.85)',
  bdrad: '4px',
  col: '#fff',
  fz: '14px',
  pad: '4px 8px',
  userSelect: 'none',
  pointerEvents: 'none',
});

export interface BasicTooltipProps extends React.AllHTMLAttributes<any> {
  Component?: 'div' | 'span';

  /**
   * The tooltip content to show on hover. Make it `undefined` to disable the
   * tooltip.
   */
  renderTooltip?: () => React.ReactNode;

  /**
   * The anchor point to compute the tooltip position.
   */
  anchor?: AnchorPointComputeSpec;

  /**
   * If true, text tooltip will be added CSS to not wrap it to new lines.
   */
  nowrap?: boolean;

  /**
   * To manually control the tooltip, set the `show` props.
   */
  show?: boolean;

  /**
   * Whether to animate the tooltip fade in.
   */
  fadeIn?: boolean;

  /**
   * Keyboard shortcut.
   */
  shortcut?: string;
}

export const BasicTooltip: React.FC<BasicTooltipProps> = ({
  Component = 'span',
  anchor,
  renderTooltip,
  nowrap,
  show,
  fadeIn,
  shortcut,
  children,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [visible, setVisible] = React.useState(false);
  const styles = useStyles();

  const handle = useAnchorPointHandle(anchor);

  // Hide tooltip on various global events.
  React.useEffect(() => {
    const listener = () => setVisible(false);
    document.addEventListener('mousedown', listener);
    document.addEventListener('scroll', listener);
    window.addEventListener('resize', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('scroll', listener);
      window.removeEventListener('resize', listener);
    };
  }, []);

  const C = Component as any;

  let drop: React.ReactNode = null;
  if (!!renderTooltip && (typeof show === 'boolean' ? show : !!visible)) {
    const {dy} = handle.get();
    drop = (
      <PositionPopup fadeIn={fadeIn}>
        <C className={tooltipClass} style={{boxShadow: styles.light ? undefined : `0 0 0 1px ${styles.g(0.1, 0.16)}`}}>
          {nowrap ? <span style={{whiteSpace: 'nowrap'}}>{renderTooltip()}</span> : renderTooltip()}
          {!!shortcut && (
            <KeyLite
              style={{
                position: 'absolute',
                left: 0,
                bottom: dy <= 0 ? 'calc(100% + 4px)' : undefined,
                top: dy > 0 ? 'calc(100% + 4px)' : undefined,
                animation: 'fadeInScaleIn .4s',
              }}
            >
              {shortcut}
            </KeyLite>
          )}
        </C>
      </PositionPopup>
    );
  }

  return (
    <anchorContext.Provider value={handle}>
      <C
        className={blockClass()}
        onMouseEnter={(e: React.MouseEvent) => {
          if (onMouseEnter) onMouseEnter(e);
          if (renderTooltip) setVisible(true);
        }}
        onMouseLeave={(e: React.MouseEvent) => {
          if (onMouseLeave) onMouseLeave(e);
          if (renderTooltip) setVisible(false);
        }}
        ref={handle.ref}
      >
        {children}
        {drop}
      </C>
    </anchorContext.Provider>
  );
};
