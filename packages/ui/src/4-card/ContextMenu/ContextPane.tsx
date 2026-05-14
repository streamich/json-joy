import * as React from 'react';
import {drule, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {ZINDEX} from '../../constants';

const paneClass = drule({
  d: 'inline-block',
  pos: 'relative',
  z: ZINDEX.CONTEXT,
  lh: '1.2em',
  l: 'auto',
  r: 0,
  bdrad: '8px',
  trs: 'transform .45s cubic-bezier(.2,2,0,1), opacity .3s',
});

const bodyClass = rule({
  pos: 'relative',
  zIndex: 2,
  bdrad: '4px',
});

const triangleClass = drule({
  pos: 'absolute',
  zIndex: 1,
  w: '7px',
  h: '7px',
  t: '2px',
  transform: 'rotate(45deg) translate(-5px,-5px)',
  borderTopLeftRadius: '2px',
});

export interface ContextPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  right?: boolean;

  // Whether to not close the drop down on click event.
  dontClose?: boolean;
  triangle?: boolean;
  hide?: boolean;

  canOverflow?: boolean;

  minWidth?: number;

  onClick?: React.MouseEventHandler;

  style?: React.CSSProperties;
  accent?: string;
  borderless?: boolean;
  transparent?: boolean;
  compact?: boolean;

  /** Render with a much lighter box-shadow, suitable for inline overlays
   * that should feel subtle. */
  lite?: boolean;

  /** Render the pane in-place in the document flow, without creating an
   * elevated stacking context. */
  inline?: boolean;

  className?: string;
  children?: React.ReactNode;
}

export type IContextPaneState = {};

export const ContextPane: React.FC<ContextPaneProps> = React.forwardRef<HTMLDivElement, ContextPaneProps>(
  (
    {
      children,
      right,
      triangle,
      canOverflow,
      minWidth,
      hide,
      style,
      accent,
      transparent,
      borderless,
      lite,
      inline,
      className,
      ...rest
    },
    ref,
  ) => {
    const styles = useStyles();
    const light = styles.light;
    const shade = light ? 0 : 0.3;
    const triangleShade = 0;
    const triangleBg = light ? '#fff' : styles.g(0.98);

    const paneCls = paneClass({
      bdt: `1px solid ${styles.g(shade, 0.1)}`,
      bdl: `1px solid ${styles.g(shade, 0.2)}`,
      bdr: `1px solid ${styles.g(shade, 0.15)}`,
      bdb: `1px solid ${styles.g(shade, 0.25)}`,
      '&:hover': {
        bdt: `1px solid ${styles.g(shade, 0.2)}`,
        bdl: `1px solid ${styles.g(shade, 0.3)}`,
        bdr: `1px solid ${styles.g(shade, 0.25)}`,
        bdb: `1px solid ${styles.g(shade, 0.35)}`,
      },
    });
    const triangleCls = triangleClass({
      bdl: `1px solid ${styles.g(triangleShade, 0.15)}`,
      bdt: `1px solid ${styles.g(triangleShade, 0.15)}`,
      bdr: `1px solid ${triangleBg}`,
      bdb: `1px solid ${triangleBg}`,
      bg: triangleBg,
      bxsh: `0 -1px 1px ${styles.g(triangleShade, 0.035)}`,
    });

    const blockStyle: React.CSSProperties = {
      background: transparent ? 'transparent' : light ? styles.bg + '' : styles.g(0.94),
      color: styles.g(0.2),
      boxShadow:
        transparent || borderless
          ? 'none'
          : lite
            ? '0 1px 2px rgba(9,30,66,.06),0 0 4px rgba(9,30,66,.04),0 0 1px rgba(9,30,66,.08)'
            : '0 4px 8px -2px rgba(9,30,66,.25),0 0 13px rgba(9,30,66,.13),0 0 1px rgba(9,30,66,.2)',
      ...(style || {}),
      border: transparent || borderless ? 'none' : undefined,
    };

    if (minWidth) {
      blockStyle.minWidth = minWidth;
    }

    if (!right) {
      blockStyle.left = 0;
      blockStyle.right = 'auto';
    }

    if (hide !== undefined) {
      blockStyle.transform = hide ? 'scale(.85)' : 'scale(1)';
      blockStyle.opacity = hide ? 0 : 1;
    }

    if (accent) {
      blockStyle.borderBottom = `2px solid ${accent}`;
    }

    if (inline) {
      blockStyle.position = 'static';
      blockStyle.zIndex = 'auto';
    }

    return (
      <div {...rest} className={paneCls + (className || '')} style={blockStyle} ref={ref}>
        <div className={bodyClass} style={{overflow: canOverflow ? 'visible' : undefined}}>
          {children}
        </div>
        {triangle && (
          <div
            className={triangleCls}
            style={{
              left: right ? 'auto' : 15,
              right: right ? 15 : 'auto',
            }}
          />
        )}
      </div>
    );
  },
);
