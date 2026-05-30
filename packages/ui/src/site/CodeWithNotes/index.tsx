import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {DisplayTitle} from '../../4-card/DisplayTitle';
import {FileIcon} from '../../1-inline/FileIcon';
import {CodeCard, type CodeAnnotationSpec} from '../../5-block/CodeCard';
import {Stepper, type StepperStep} from '../../5-block/Stepper';
import {FiftyFifty} from '../FiftyFifty';

export interface CodeWithNotesProps {
  eyebrow?: React.ReactNode;
  heading?: React.ReactNode;
  /** Prose shown beside the code; pass one or more `<p>` elements. */
  notes?: React.ReactNode;
  /** Numbered steps shown beside the code, instead of `notes`. Good for sequential flows. */
  steps?: StepperStep[];
  code: string;
  lang?: string;
  /** File name shown in the code block header. */
  fileName?: string;
  /** Icon shown left of the file name. Defaults to a {@link FileIcon} derived from the file extension. */
  icon?: React.ReactNode;
  /** Render a line-number gutter. */
  lineNumbers?: boolean;
  /** Hover annotations, targeted by literal substring match. */
  annotations?: CodeAnnotationSpec[];
  /** Optional caption line shown beneath the code. */
  caption?: React.ReactNode;
}

const blockClass = rule({
  pad: '64px 16px',
});

const notesClass = rule({
  mar: '20px 0 0',
  '& p': {
    ...theme.font.display.lite,
    col: theme.g(0.32),
    fz: '16px',
    lh: '1.7em',
    mar: '0 0 16px',
    pad: 0,
  },
  '& p:last-child': {mar: 0},
  '& code': {
    ...theme.font.mono.mid,
    fz: '0.88em',
  },
});

const captionClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.5),
  fz: '13px',
  lh: '1.6em',
  mar: '16px 0 0',
  pad: 0,
});

const stepperClass = rule({
  mar: '28px 0 0',
});

/**
 * A code block paired with explanatory prose on its side. The notes sit on the
 * left, the syntax-highlighted code (with hover annotations) on the right; the
 * two stack on narrow screens with the notes on top.
 */
export const CodeWithNotes: React.FC<CodeWithNotesProps> = ({
  eyebrow,
  heading,
  notes,
  steps,
  code,
  lang = 'ts',
  fileName,
  icon,
  lineNumbers,
  annotations,
  caption,
}) => {
  const ext = fileName?.split('.').pop();
  const fileIcon = icon ?? (ext ? <FileIcon label={ext} ext={ext} size={16} /> : undefined);
  const left = (
    <div>
      <DisplayTitle eyebrow={eyebrow} title={heading} card />
      {steps ? (
        <Stepper steps={steps} compact className={stepperClass} />
      ) : (
        !!notes && <div className={notesClass}>{notes}</div>
      )}
    </div>
  );
  const right = (
    <div>
      <CodeCard
        code={code}
        lang={lang}
        fileName={fileName}
        icon={fileIcon}
        lineNumbers={lineNumbers}
        annotations={annotations}
      />
      {!!caption && <p className={captionClass}>{caption}</p>}
    </div>
  );
  return (
    <section className={blockClass}>
      <FiftyFifty left={left} right={right} verticalAlign="start" gap={56} leftShare={0.45} />
    </section>
  );
};

export default CodeWithNotes;
