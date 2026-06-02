import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Button} from '../../2-inline-block/Button';
import {DisplayTitle} from '../../4-card/DisplayTitle';
import {FrameShot, type FrameShotProps} from '../../5-block/FrameShot';

export interface ScreenshotShowcaseProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Screenshot image URL, e.g. `cdnUrl('/screenshots/foo.png')`. */
  src: string;
  alt: string;
  /** Where the CTA button and the screenshot link point. */
  href: string;
  /** CTA button label. Omit to hide the button. */
  cta?: React.ReactNode;
  /** Icon shown left of the CTA label. */
  icon?: React.ReactElement<any>;
  /** Screenshot intrinsic aspect ratio (width / height). */
  aspect?: number;
  /** Corner radius of the screenshot. Defaults to 16. */
  imageRadius?: number;
  /** FrameShot layout passthroughs. */
  anchor?: FrameShotProps['anchor'];
  split?: number;
  edgeGap?: number;
  hideBelow?: number;
  narrow?: boolean;
  /** Screenshot width at full size, in pixels. Larger = taller block. */
  screenshotWidth?: number;
  /** Screenshot width just before it slides away, in pixels. */
  screenshotMinWidth?: number;
  /** Pixels of the screenshot hidden past the bottom edge. Smaller = taller block. */
  bottomOverflow?: number;
  /** Gap above the screenshot, so its top does not touch the frame edge. */
  topGap?: number;
  /** Window width at or above which the screenshot is at full size. */
  fullWidthAbove?: number;
  /** Overlay placed over the screenshot, e.g. a `<FloatingZoom>`. */
  children?: React.ReactNode;
}

const textColClass = rule({
  pos: 'relative',
  z: 2,
  maxW: '320px',
  pd: '48px 64px',
  '@media (max-width: 600px)': {
    maxW: 'none',
    pd: '16px',
  },
});

const ctaClass = rule({
  pd: '32px 0 0',
  w: '100%',
});

/**
 * A `<FrameShot>` showing a product screenshot with copy and a CTA on the side.
 * The screenshot links out and scales/slides away on narrow screens.
 */
export const ScreenshotShowcase: React.FC<ScreenshotShowcaseProps> = ({
  eyebrow,
  title,
  subtitle,
  src,
  alt,
  href,
  cta,
  icon,
  aspect = 1101 / 968,
  imageRadius = 16,
  anchor = 'bottom-right',
  split = 42,
  edgeGap = -32,
  hideBelow = 700,
  narrow = true,
  screenshotWidth,
  screenshotMinWidth,
  bottomOverflow,
  topGap,
  fullWidthAbove,
  children,
}) => {
  const styles = useStyles();
  const external = /^https?:\/\//.test(href);

  const content = (
    <div className={textColClass}>
      <DisplayTitle small eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {!!cta && (
        <div className={ctaClass}>
          <Button href={href} ghost invert radius={1} size={1} icon={icon}>
            {cta}
          </Button>
        </div>
      )}
    </div>
  );

  const screenshot = (
    <a
      href={href}
      aria-label={alt}
      style={{display: 'block'}}
      {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          userSelect: 'none',
          borderRadius: imageRadius,
          border: '1px solid ' + styles.g(0, 0.25),
          boxShadow: '0 0 16px rgba(0,0,0,.1), 0 0 8px rgba(0,0,0,.1)',
        }}
      />
    </a>
  );

  return (
    <FrameShot
      narrow={narrow}
      content={content}
      screenshot={screenshot}
      screenshotAspect={aspect}
      anchor={anchor}
      split={split}
      edgeGap={edgeGap}
      hideBelow={hideBelow}
      screenshotWidth={screenshotWidth}
      screenshotMinWidth={screenshotMinWidth}
      bottomOverflow={bottomOverflow}
      topGap={topGap}
      fullWidthAbove={fullWidthAbove}
    >
      {children}
    </FrameShot>
  );
};

export default ScreenshotShowcase;
