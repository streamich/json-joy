import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {ColorTokens, type DecorateToken} from 'code-colors-react';
import {useStyles} from '../../styles/context';
import {CopyButton} from '../../2-inline-block/CopyButton';
import {Pill} from '../../1-inline/Pill';
import Paper from '../../4-card/Paper';
import {CodeAnnotation, annotationGroupContext, type AnnotationGroupContext} from '../../4-card/CodeAnnotation';
import type {Token} from 'code-colors/lib';

const FONT = '"JetBrains Mono", "Fira Code", Menlo, monospace';
const LINE_HEIGHT = 1.6;
const HIDE_DELAY = 140;

export interface CodeAnnotationSpec {
  /** Literal code text to annotate. */
  match: string;
  /** Which occurrence to annotate when the text repeats (1-based). */
  nth?: number;
  /** Rich content rendered in the hover popover. */
  popup: React.ReactNode;
  /** Accent color for the dotted underline. */
  color?: string;
}

export interface CodeCardProps {
  code: string;
  lang?: string;
  /** File name shown in the header. */
  fileName?: string;
  /** Icon shown left of the file name. */
  icon?: React.ReactNode;
  /** Show the language chip in the header. Defaults to `true` when `lang` is set. */
  showLang?: boolean;
  /** Render a line-number gutter. */
  lineNumbers?: boolean;
  /** Show the copy-to-clipboard button. Defaults to `true`. */
  copy?: boolean;
  /** Hover annotations, targeted by literal substring match. */
  annotations?: CodeAnnotationSpec[];
  className?: string;
}

interface Range {
  id: number;
  start: number;
  end: number;
  popup: React.ReactNode;
  color?: string;
}

const tokenLen = (t: Token): number => {
  if (typeof t === 'number') return t;
  let n = 0;
  for (const c of t[1]) n += tokenLen(c);
  return n;
};

const computeRanges = (code: string, anns: CodeAnnotationSpec[]): Range[] => {
  const ranges: Range[] = [];
  anns.forEach((a, id) => {
    const nth = a.nth ?? 1;
    let idx = -1;
    let from = -1;
    for (let k = 0; k < nth; k++) {
      idx = code.indexOf(a.match, from + 1);
      if (idx === -1) break;
      from = idx;
    }
    if (idx === -1) return;
    ranges.push({id, start: idx, end: idx + a.match.length, popup: a.popup, color: a.color});
  });
  return ranges.sort((x, y) => x.start - y.start);
};

const makeDecorate = (ranges: Range[]): DecorateToken | undefined => {
  if (!ranges.length) return undefined;
  return (token, node, _lang, code, pos) => {
    const len = tokenLen(token as Token);
    const end = pos + len;
    const r = ranges.find((rng) => rng.start < end && rng.end > pos);
    if (!r) return undefined;
    if (pos >= r.start && end <= r.end) {
      return (
        <CodeAnnotation id={r.id} primary={pos === r.start} last={end === r.end} popup={r.popup} color={r.color}>
          {node}
        </CodeAnnotation>
      );
    }
    // Partial overlap on a plain-text run: split at the range boundary.
    if (typeof token === 'number') {
      const text = typeof node === 'string' ? node : code.slice(pos, end);
      const a = Math.max(r.start, pos);
      const b = Math.min(r.end, end);
      return (
        <>
          {text.slice(0, a - pos)}
          <CodeAnnotation id={r.id} primary={a === r.start} last={b === r.end} popup={r.popup} color={r.color}>
            {text.slice(a - pos, b - pos)}
          </CodeAnnotation>
          {text.slice(b - pos)}
        </>
      );
    }
    // Partial overlap on a syntax node: its children were decorated already.
    return undefined;
  };
};

const wrapClass = rule({
  pos: 'relative',
});

const metaBarClass = rule({
  ...theme.font.sans.mid,
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
  fw: 'wrap',
  us: 'none',
  fz: '13px',
  pad: '8px 8px 8px 16px',
});

const metaLeftClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  minW: 0,
});

const iconClass = rule({
  d: 'inline-flex',
  ai: 'center',
  flex: '0 0 auto',
});

const fileNameClass = rule({
  ...theme.font.mono.mid,
  whiteSpace: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  minW: 0,
});

const metaRightClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  marginInlineStart: 'auto',
  flex: '0 0 auto',
});

const preClass = rule({
  mar: 0,
  w: '100%',
  ovx: 'auto',
  d: 'flex',
  ai: 'stretch',
  ff: FONT,
  fz: '13.5px',
  lh: `${LINE_HEIGHT}em`,
});

const gutterClass = rule({
  flexShrink: 0,
  pad: '16px 12px 18px 16px',
  us: 'none',
  pe: 'none',
  ta: 'right',
  op: 0.3,
  whiteSpace: 'pre',
});

const codeClass = rule({
  d: 'block',
  flex: '1',
  minW: 0,
  pad: '16px 18px 18px 18px',
  mar: 0,
  whiteSpace: 'pre',
  tabSize: 4,
  fontVariantLigatures: 'none',
});

export const CodeCard: React.FC<CodeCardProps> = ({
  code,
  lang,
  fileName,
  icon,
  showLang,
  lineNumbers,
  copy = true,
  annotations,
  className,
}) => {
  const styles = useStyles();
  const [open, setOpen] = React.useState<number | null>(null);
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const matchesKey = (annotations ?? []).map((a) => `${a.match}$${a.nth ?? 1}$${a.color ?? ''}`).join(':');
  // biome-ignore lint/correctness/useExhaustiveDependencies: matchesKey is a content-based hash of annotations to avoid recomputation on new array identity with same content.
  const ranges = React.useMemo(() => computeRanges(code, annotations ?? []), [code, matchesKey]);
  const decorate = React.useMemo(() => makeDecorate(ranges), [ranges]);

  const group = React.useMemo<AnnotationGroupContext>(
    () => ({
      open,
      show: (id) => {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        setOpen(id);
      },
      hideSoon: () => {
        hideTimer.current = setTimeout(() => setOpen(null), HIDE_DELAY);
      },
      cancelHide: () => {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
      },
    }),
    [open],
  );

  React.useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  const lineCount = React.useMemo(() => (code.match(/\n/g)?.length ?? 0) + 1, [code]);
  const gutter = lineNumbers ? Array.from({length: lineCount}, (_, i) => i + 1).join('\n') : null;

  const getCode = React.useCallback(() => code, [code]);

  const chip = (showLang ?? !!lang) && !!lang;
  const showHeader = !!fileName || !!icon || chip || copy;

  return (
    <div className={wrapClass + (className ? ' ' + className : '')}>
      <Paper round hover style={{overflow: 'hidden'}}>
        {showHeader && (
          <div
            className={metaBarClass}
            style={{borderBottom: `1px solid ${styles.g(0, styles.light ? 0.06 : 0.1)}`, color: '' + styles.g(0.35)}}
          >
            <span className={metaLeftClass}>
              {!!icon && (
                <span className={iconClass} style={{color: '' + styles.g(0.5)}}>
                  {icon}
                </span>
              )}
              {!!fileName && <span className={fileNameClass}>{fileName}</span>}
            </span>
            <span className={metaRightClass}>
              {chip && <Pill>{lang}</Pill>}
              {copy && <CopyButton onCopy={getCode} width={28} height={28} rounder />}
            </span>
          </div>
        )}
        <pre dir="ltr" className={preClass}>
          {gutter !== null && (
            <span className={gutterClass} aria-hidden="true" style={{borderRight: `1px solid ${styles.g(0, 0.08)}`}}>
              {gutter}
            </span>
          )}
          <annotationGroupContext.Provider value={group}>
            <ColorTokens as="code" className={codeClass} code={code} lang={lang} decorate={decorate} />
          </annotationGroupContext.Provider>
        </pre>
      </Paper>
    </div>
  );
};

export default CodeCard;
