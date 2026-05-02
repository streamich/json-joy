import * as React from 'react';
import {rule, font} from 'nano-theme';
import {useReadOnly, type RenderElementProps} from 'slate-react';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {BlockPlaceholder} from '../BlockPlaceholder';
import {indentPadding} from '../../../behavior/indentation';
import {isEmptyBlock} from '../../../util';
import {CalloutOptionsPopup} from './CalloutOptionsPopup';
import {HslColor, LinearRgbColor, ThemeColor} from '@jsonjoy.com/ui';
import type {CalloutElement as CalloutElementType} from '../../../types';

const DEFAULT_ACCENT = '#07f';

const calloutClass = rule({
  pos: 'relative',
  mr: '24px 0',
  pd: '14px 16px 14px 18px',
  bdrad: '8px',
  d: 'flex',
  fld: 'column',
  gap: '6px',
});

const headerClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '8px',
  us: 'none',
});

const iconClass = rule({
  ...font.slab.bold,
  fz: '1.3rem',
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  // fz: '18px',
  lh: 1,
  flexShrink: 0,
});

const titleClass = rule({
  ...font.ui3.mid,
  textTransform: '',
  d: 'inline-flex',
  ai: 'center',
  h: '100%',
  fz: '0.95rem',
  lh: 1.3,
  flex: '1',
  minW: '0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const moreClass = rule({
  marginLeft: 'auto',
  flexShrink: 0,
  op: 0,
  trs: 'opacity 0.2s',
  [`.${calloutClass.trim()}:hover &`]: {
    op: 1,
  },
});

const bodyClass = rule({
  pos: 'relative',
  m: '0',
});

export interface CalloutElementProps extends RenderElementProps {
  element: CalloutElementType;
}

export const CalloutElement: React.FC<CalloutElementProps> = ({attributes, children, element}) => {
  const styles = useStyles();
  const readOnly = useReadOnly();

  const accent = element.color?.trim() || DEFAULT_ACCENT;
  const icon = element.icon ?? '';
  const title = element.title?.trim() ?? '';
  const hasHeader = !!icon || !!title || !readOnly;

  const colors = React.useMemo(() => {
    const hsl = HslColor.from(accent) ?? HslColor.from(DEFAULT_ACCENT)!;
    const bg = styles.light ? HslColor.from('#fff')! : HslColor.from('#000')!;
    const mainColor = new ThemeColor(hsl.norm(), bg);
    const accentColor = HslColor.from(accent) ?? HslColor.from(DEFAULT_ACCENT)!;
    const accentColorTitle = accentColor.toLinearRgb().adjToContrast(new LinearRgbColor(1, 1, 1));
    const shadow = mainColor.fg.copy();
    shadow.a = 0.08;
    return {
      accent: mainColor.toString(),
      bg: mainColor.g(0.02),
      bd: mainColor.col(0.16).fg.pct(0, -0.5).toString(),
      shadow: shadow.toString(),
      title: accentColorTitle.toString(),
    };
  }, [accent]);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <aside
      {...attributes}
      className={calloutClass}
      style={{
        textAlign: element.align,
        marginInlineStart: indentPadding(element.indent) ?? 0,
        marginInlineEnd: 0,
        border: `1px solid ${colors.bd}`,
        borderLeft: `3px solid ${colors.accent}`,
        background: colors.bg,
        color: styles.g(0.18),
        boxShadow: `0 1px 4px ${colors.shadow}`,
      }}
    >
      {hasHeader && (
        <div contentEditable={false} className={headerClass}>
          {!!icon && (
            <span className={iconClass} style={{color: colors.title}}>
              {icon}
            </span>
          )}
          {!!title && (
            <span className={titleClass} style={{color: colors.title}}>
              {title}
            </span>
          )}
          {!readOnly && (
            <span className={moreClass}>
              <Popup renderContext={() => <CalloutOptionsPopup element={element} />}>
                <BasicButtonMore
                  type="button"
                  width={24}
                  height={24}
                  rounder
                  tooltip="Callout options"
                  onMouseDown={preventMouseDown}
                />
              </Popup>
            </span>
          )}
        </div>
      )}
      <div className={bodyClass}>
        {children}
        {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
      </div>
    </aside>
  );
};
