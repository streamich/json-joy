import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {DisplayTitle} from '../../4-card/DisplayTitle';

export interface DemoSectionProps {
  eyebrow?: React.ReactNode;
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  /** The interactive demo to present. */
  children: React.ReactNode;
  /** Optional caption shown beneath the demo. */
  caption?: React.ReactNode;
  /** Center the title block above the demo. */
  center?: boolean;
}

const blockClass = rule({
  pad: '32px',
});

const demoClass = rule({
  mar: '32px 0 0',
});

const captionClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.5),
  fz: '13px',
  lh: '1.6em',
  mar: '16px 0 0',
  pad: 0,
});

/**
 * Reusable wrapper for interactive demos: a title block ({@link DisplayTitle})
 * above the demo, with an optional caption beneath. The demo itself is rendered
 * as-is so each demo keeps its own internal layout.
 */
export const DemoSection: React.FC<DemoSectionProps> = ({eyebrow, heading, subheading, children, caption, center}) => {
  return (
    <section className={blockClass}>
      <DisplayTitle eyebrow={eyebrow} title={heading} subtitle={subheading} center={center} />
      <div className={demoClass}>{children}</div>
      {!!caption && (
        <p className={captionClass} style={center ? {textAlign: 'center'} : undefined}>
          {caption}
        </p>
      )}
    </section>
  );
};

export default DemoSection;
