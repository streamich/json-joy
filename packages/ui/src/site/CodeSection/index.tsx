import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {DisplayTitle} from '../../4-card/DisplayTitle';
import {CodeCard, type CodeAnnotationSpec} from '../../5-block/CodeCard';

export interface CodeSectionProps {
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  /** Short line shown above the code. */
  intro?: React.ReactNode;
  code: string;
  lang?: string;
  /** File name shown in the code block header. */
  fileName?: string;
  /** Icon shown left of the file name. */
  icon?: React.ReactNode;
  /** Render a line-number gutter. */
  lineNumbers?: boolean;
  /** Hover annotations, targeted by literal substring match. */
  annotations?: CodeAnnotationSpec[];
  /** Optional caption line shown beneath the code. */
  caption?: React.ReactNode;
}

const blockClass = rule({
  pad: '64px 0',
});

const introClass = rule({
  ...theme.font.display.mid,
  col: theme.g(0.32),
  fz: '16px',
  lh: '1.6em',
  mar: '24px 0 16px',
  pad: 0,
});

const captionClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.5),
  fz: '14px',
  lh: '1.6em',
  mar: '16px 0 0',
  pad: 0,
});

/**
 * Reusable code section: a heading, a short intro line, a syntax-highlighted
 * code block, and an optional caption.
 */
export const CodeSection: React.FC<CodeSectionProps> = ({
  heading,
  subheading,
  intro,
  code,
  lang = 'ts',
  fileName,
  icon,
  lineNumbers,
  annotations,
  caption,
}) => {
  return (
    <section className={blockClass}>
      <DisplayTitle title={heading} subtitle={subheading} />
      {!!intro && <p className={introClass}>{intro}</p>}
      <CodeCard
        code={code}
        lang={lang}
        fileName={fileName}
        icon={icon}
        lineNumbers={lineNumbers}
        annotations={annotations}
      />
      {!!caption && <p className={captionClass}>{caption}</p>}
    </section>
  );
};

export default CodeSection;
