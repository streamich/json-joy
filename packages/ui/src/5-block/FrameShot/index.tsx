import * as React from 'react';
import {rule} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Frame, type FrameProps} from '../Frame';

const stageClass = rule({
  pos: 'relative',
  d: 'flex',
  ai: 'center',
  w: '100%',
  bxz: 'border-box',
});

const clipClass = rule({
  pos: 'absolute',
  inset: 0,
  ov: 'hidden',
});

const contentClass = rule({
  pos: 'relative',
  z: 2,
});

const shotClass = rule({
  pos: 'absolute',
  d: 'block',
});

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export interface FrameShotProps extends FrameProps {
  /** Text or other small copy rendered beside the screenshot. */
  content: React.ReactNode;
  /** The UI screenshot. Any node, an `<img>` should be `display:block;width:100%`. */
  screenshot: React.ReactNode;
  /** Screenshot intrinsic aspect ratio (width / height). Used to place overlays. */
  screenshotAspect?: number;
  /** Corner the screenshot is anchored to. Defaults to `bottom-right`. */
  anchor?: 'bottom-right' | 'bottom-left';
  /**
   * Percent of the frame width given to the content column. The screenshot's
   * inner edge is pinned to this line, so the two never overlap.
   */
  split?: number;
  /** Pixels of the screenshot hidden past the bottom edge. */
  bottomOverflow?: number;
  /** Gap above the screenshot, so its top does not touch the frame edge. Defaults to `0`. */
  topGap?: number;
  /**
   * Horizontal nudge from the split line, in pixels. Positive pushes the
   * screenshot further out (more bleed off the outer edge), negative pulls it
   * toward the content. Defaults to `0`.
   */
  edgeGap?: number;
  /** Screenshot width at full width, in pixels. */
  screenshotWidth?: number;
  /** Screenshot width just before it slides away, in pixels. */
  screenshotMinWidth?: number;
  /** At or below this window width the screenshot is gone (content-only). */
  hideBelow?: number;
  /** At or above this window width the screenshot is at full size. */
  fullWidthAbove?: number;
  /** Corner radius the bleeding screenshot is clipped to. Matches Frame's card. */
  radius?: number;
  /**
   * Overlay placed over the screenshot box, e.g. a `<FloatingZoom>`. It is
   * rendered outside the clip, so it is never cut off, and its `(x, y)`
   * fractions map onto the screenshot.
   */
  children?: React.ReactNode;
}

/**
 * A `<Frame>` that shows a UI screenshot with copy on the side. The screenshot
 * scales down with the viewport and seamlessly slides off its anchored edge
 * before disappearing on narrow screens, the layout collapses to content-only.
 */
export const FrameShot: React.FC<FrameShotProps> = ({
  content,
  screenshot,
  screenshotAspect = 1101 / 968,
  anchor = 'bottom-right',
  split = 38,
  bottomOverflow = 73,
  topGap = 0,
  edgeGap = 0,
  screenshotWidth = 760,
  screenshotMinWidth = 550,
  hideBelow = 600,
  fullWidthAbove = 1160,
  radius = 32,
  children,
  ...rest
}) => {
  const {width} = useWindowSize();
  const showShot = width > hideBelow;

  let body: React.ReactNode;
  if (!showShot) {
    body = <div className={contentClass}>{content}</div>;
  } else {
    const t = clamp01((width - hideBelow) / (fullWidthAbove - hideBelow));
    const shotW = Math.round(screenshotMinWidth + (screenshotWidth - screenshotMinWidth) * t);
    const shotH = Math.round(shotW / screenshotAspect);
    const visibleH = Math.max(0, shotH - bottomOverflow);
    const left = anchor === 'bottom-left';
    const slide = edgeGap;
    const side = left ? 'right' : 'left';

    const boxGeom: React.CSSProperties = {
      bottom: -bottomOverflow,
      [side]: `${split}%`,
      width: shotW,
      transform: `translateX(${left ? -slide : slide}px)`,
    };
    const contentStyle: React.CSSProperties = left ? {width: `${split}%`, marginLeft: 'auto'} : {width: `${split}%`};

    body = (
      <div className={stageClass} style={{minHeight: visibleH + topGap}}>
        <div className={clipClass} style={{borderRadius: radius}}>
          <div className={shotClass} style={boxGeom}>
            {screenshot}
          </div>
        </div>
        <div className={contentClass} style={contentStyle}>
          {content}
        </div>
        {!!children && (
          <div className={shotClass} style={{...boxGeom, height: shotH, zIndex: 3, pointerEvents: 'none'}}>
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <Frame noPadding {...rest}>
      {body}
    </Frame>
  );
};

export default FrameShot;
