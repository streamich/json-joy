import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButtonDelete} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonDelete';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {ArgsPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ArgsPane';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {convertLatexToAsciiMath, convertLatexToMarkup, convertLatexToMathMl} from 'mathlive';
import {useT} from 'use-t';
import {MATH_SIZE_FONT} from '../components/blocks/math/settings';
import type {MenuItem, Param} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {MathSize} from '../types';
import type {MathfieldElement} from 'mathlive';
import type {InlineMathState} from './InlineMathState';

import 'mathlive';
import 'mathlive/fonts.css';
import 'mathlive/static.css';

const containerClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '10px',
  pd: '12px 0 4px',
  w: '480px',
  maxW: '90vw',
});

const headerClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '8px',
  pd: '0 14px',
});

const headerActionsClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '4px',
});

const fieldWrapClass = rule({
  pos: 'relative',
  d: 'flex',
  ai: 'center',
  w: '100%',
  minW: 0,
  pd: '4px 6px',
  bdrad: '6px',
  bxz: 'border-box',
  ov: 'hidden',
});

const fieldWrapOuterClass = rule({
  pd: '0 14px',
  minW: 0,
});

const mathFieldClass = rule({
  '&::part(content)': {
    ovx: 'auto',
    ovy: 'hidden',
  },
});

const SizeIcon = makeIcon({set: 'bootstrap', icon: 'aspect-ratio', width: 16, height: 16});
const LabelIcon = makeIcon({set: 'bootstrap', icon: 'tag', width: 16, height: 16});

const renderSizeIcon = () => <SizeIcon />;
const renderLabelIcon = () => <LabelIcon />;

const SIZE_OPTIONS: {id: MathSize; name: string}[] = [
  {id: 'M', name: 'M — Script'},
  {id: 'S', name: 'S — Scriptscript'},
];

const safeConvert = (fn: (s: string) => string, tex: string): string => {
  try {
    return fn(tex);
  } catch {
    return '';
  }
};

export interface InlineMathPopupProps {
  state: InlineMathState;
}

export const InlineMathPopup: React.FC<InlineMathPopupProps> = ({state}) => {
  const [t] = useT();
  const styles = useStyles();
  const val = state.draftVal.use();
  const size = state.draftSize.use();
  const label = state.draftLabel.use();
  const editingPath = state.editingPath.use();
  const fieldRef = React.useRef<MathfieldElement | null>(null);

  React.useEffect(() => {
    const el = fieldRef.current as any;
    if (!el) return;
    if (typeof el.value === 'string' && el.value !== val) {
      el.value = val;
    }
    const raf = requestAnimationFrame(() => {
      try {
        el.focus?.();
      } catch {}
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  React.useEffect(() => {
    const el = fieldRef.current as any;
    if (!el) return;
    const onInput = () => {
      const next: string = el.value ?? '';
      state.setDraftVal(next);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        state.apply();
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        state.close();
      }
    };
    el.addEventListener('input', onInput);
    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('input', onInput);
      el.removeEventListener('keydown', onKeyDown);
    };
  }, [state]);

  const isDark = !styles.light;
  const fieldColor = styles.g(0.15);
  const fieldBg = isDark ? styles.g(1, 0.04) : styles.g(0, 0.04);
  const fieldBorder = isDark ? styles.g(1, 0.1) : styles.g(0, 0.08);
  const sizeFontSize = MATH_SIZE_FONT[size];

  const onCancel = React.useCallback(() => state.close(), [state]);
  const onRemove = React.useCallback(() => state.remove(), [state]);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const ascii = React.useMemo(() => (val ? safeConvert(convertLatexToAsciiMath, val) : ''), [val]);
  const mathMl = React.useMemo(() => (val ? safeConvert(convertLatexToMathMl, val) : ''), [val]);
  const mathHtml = React.useMemo(() => (val ? safeConvert(convertLatexToMarkup, val) : ''), [val]);

  const item: MenuItem = React.useMemo(
    () => ({name: t('Equation options'), compact: true}),
    [t],
  );

  const params: (Param | MenuItem)[] = React.useMemo(() => {
    const list: (Param | MenuItem)[] = [];

    list.push({
      kind: 'select',
      id: 'size',
      name: t('Size'),
      icon: renderSizeIcon,
      default: size,
      options: SIZE_OPTIONS,
    });
    list.push({
      kind: 'str',
      id: 'label',
      name: t('Label'),
      icon: renderLabelIcon,
      optional: true,
      placeholder: t('e.g. eq:pythagoras'),
      default: label,
    });

    if (val) {
      list.push({name: t('Source'), heading: true, collapsible: true, initialCollapsed: true});
      list.push({
        kind: 'code',
        id: 'tex',
        name: 'LaTeX',
        variant: 'block',
        value: val,
      });
      if (ascii) {
        list.push({
          kind: 'code',
          id: 'ascii',
          name: 'ASCII Math',
          variant: 'block',
          value: ascii,
        });
      }
      if (mathMl) {
        list.push({
          kind: 'code',
          id: 'mathMl',
          name: 'MathML',
          variant: 'block',
          value: mathMl,
        });
      }
      if (mathHtml) {
        list.push({
          kind: 'code',
          id: 'mathHtml',
          name: 'HTML',
          variant: 'block',
          value: mathHtml,
        });
      }
    }

    return list;
  }, [t, size, label, val, ascii, mathMl, mathHtml]);

  const onChange = React.useCallback(
    (_list: [string, unknown][], map: Record<string, unknown>) => {
      const nextSize = map.size === 'S' ? 'S' : 'M';
      if (nextSize !== state.draftSize.value) state.setDraftSize(nextSize as MathSize);
      const nextLabel = (map.label as string | undefined) ?? '';
      if (nextLabel !== state.draftLabel.value) state.setDraftLabel(nextLabel);
    },
    [state],
  );

  return (
    <ContextPane>
      <div className={containerClass}>
        <div className={headerClass}>
          <MiniTitle>{editingPath ? t('Edit equation') : t('Add equation')}</MiniTitle>
          {editingPath && (
            <div className={headerActionsClass}>
              <BasicTooltip nowrap renderTooltip={() => t('Remove equation')}>
                <BasicButtonDelete
                  type="button"
                  width={32}
                  height={32}
                  rounder
                  onMouseDown={preventMouseDown}
                  onConfirm={onRemove}
                />
              </BasicTooltip>
            </div>
          )}
        </div>

        <div className={fieldWrapOuterClass}>
          <div
            className={fieldWrapClass}
            style={{
              background: fieldBg,
              border: `1px solid ${fieldBorder}`,
              colorScheme: isDark ? 'dark' : 'light',
              fontSize: sizeFontSize,
            }}
          >
            {React.createElement('math-field', {
              ref: fieldRef as any,
              'default-mode': 'inline-math',
              className: mathFieldClass,
              style: {
                display: 'block',
                flex: '1 1 0',
                width: '100%',
                minWidth: 0,
                maxWidth: '100%',
                boxSizing: 'border-box',
                padding: 0,
                color: fieldColor,
                background: 'transparent',
                ['--primary' as any]: fieldColor,
                ['--text-font-family' as any]: 'inherit',
                ['--caret-color' as any]: fieldColor,
                ['--keycap-background' as any]: isDark ? styles.g(1, 0.08) : styles.g(0, 0.06),
                ['--keycap-background-hover' as any]: isDark ? styles.g(1, 0.16) : styles.g(0, 0.1),
                ['--keycap-text' as any]: fieldColor,
                ['--keyboard-background' as any]: isDark ? styles.g(1, 0.04) : styles.g(0, 0.04),
                ['--keyboard-text' as any]: fieldColor,
                ['--smart-fence-color' as any]: fieldColor,
              },
            })}
          </div>
        </div>

        <div>
          <ArgsPane inline item={item} params={params} onCancel={onCancel} onChange={onChange} />
        </div>
      </div>
    </ContextPane>
  );
};
