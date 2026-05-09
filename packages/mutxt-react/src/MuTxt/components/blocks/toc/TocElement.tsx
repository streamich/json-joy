import * as React from 'react';
import {rule} from 'nano-theme';
import {Transforms} from 'slate';
import {ReactEditor, useFocused, useReadOnly, useSelected, useSlateStatic, type RenderElementProps} from 'slate-react';
import {More as MoreIcon} from '@jsonjoy.com/ui/lib/icons/interactive/More';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useMuTxt} from '../../../context';
import {TocOptionsPopup} from './TocOptionsPopup';
import * as settings from './settings';
import type {DocumentOutlineItem} from '../../../behavior/outline';
import type {MenuItem, TocElement as TocElementType} from '../../../types';

const blockClass = rule({
  pos: 'relative',
  mr: '20px 0',
  bdrad: '6px',
  bxz: 'border-box',
  us: 'none',
});

const captionClass = rule({
  fz: '11px',
  fw: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  mb: '4px',
  mrl: '8px',
});

const listClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '0',
});

const itemClass = rule({
  d: 'block',
  pd: '1px 8px',
  bdrad: '4px',
  cur: 'pointer',
  trs: 'background 120ms ease, color 120ms ease',
  ws: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

const itemTitleClass = rule({
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  textDecorationThickness: '1px',
  [`.${itemClass.trim()}:hover &`]: {
    textDecorationThickness: '2px',
  },
});

const stripButtonClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'flex-start',
  w: '11%',
  h: '14px',
  mb: '2px',
  mrl: '8px',
  pad: 0,
  bd: 'none',
  bgc: 'transparent',
  cur: 'pointer',
});

const stripBarClass = rule({
  d: 'block',
  w: '100%',
  h: '4px',
  bdrad: '2px',
  bgc: 'currentColor',
  op: 0.06,
  trs: 'opacity 120ms ease',
  [`.${stripButtonClass.trim()}:hover &`]: {
    op: 0.2,
  },
});

const emptyClass = rule({
  fz: '13px',
  lh: 1.5,
});

const moreWrapClass = rule({
  pos: 'absolute',
  t: '-16px',
  insetInlineEnd: '8px',
  trs: 'opacity 0.15s ease',
  z: 1,
});

interface NumberedItem extends DocumentOutlineItem {
  number?: string;
}

const computeNumbers = (items: DocumentOutlineItem[]): NumberedItem[] => {
  const counters: number[] = [0, 0, 0, 0, 0, 0, 0];
  return items.map((item) => {
    const lvl = item.level;
    counters[lvl] = (counters[lvl] || 0) + 1;
    for (let i = lvl + 1; i < counters.length; i++) counters[i] = 0;
    if (lvl === 0) return {...item};
    const parts: number[] = [];
    for (let i = 1; i <= lvl; i++) parts.push(counters[i] || 0);
    return {...item, number: parts.join('.') + '.'};
  });
};

export interface TocElementProps extends RenderElementProps {
  element: TocElementType;
}

export const TocElement: React.FC<TocElementProps> = ({attributes, children, element}) => {
  const styles = useStyles();
  const readOnly = useReadOnly();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const selected = isSelected && isFocused;
  const editor = useSlateStatic();
  const mutxt = useMuTxt();
  mutxt.contentVersion.use();
  const [hovered, setHovered] = React.useState(false);

  const maxLevel = settings.getTocMaxLevel(element.maxLevel);
  const includeTitle = settings.getTocIncludeTitle(element.includeTitle);
  const numbered = settings.getTocNumbered(element.numbered);
  const caption = element.caption?.trim() ?? '';

  const filtered = React.useMemo(() => {
    const all = mutxt.outline();
    return all.filter((item) => {
      if (item.level === 0) return includeTitle;
      return item.level <= maxLevel;
    });
    // outline cache key changes on contentVersion, which is subscribed above
  }, [mutxt, mutxt.contentVersion.value, includeTitle, maxLevel]);

  const numberedItems = React.useMemo<NumberedItem[]>(
    () => (numbered ? computeNumbers(filtered) : filtered.map((i) => ({...i}))),
    [filtered, numbered],
  );
  const hasTitle = numberedItems[0]?.level === 0;

  const onItemClick = React.useCallback(
    (item: DocumentOutlineItem) => (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      mutxt.api.navigateTo(item.path);
    },
    [mutxt],
  );

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const selectBlock = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        const path = ReactEditor.findPath(editor, element);
        Transforms.select(editor, path);
        ReactEditor.focus(editor);
      } catch {}
    },
    [editor, element],
  );

  const tocMenu = React.useMemo<MenuItem>(
    () => ({
      name: 'TOC toolbar',
      children: [
        {
          name: 'Options',
          icon: () => <MoreIcon size={32} />,
          pane: () => <TocOptionsPopup element={element} />,
        },
      ],
    }),
    [element],
  );

  const linkColor = styles.g(0.18);
  const captionColor = styles.g(0.42);
  const numberColor = styles.g(0.5);
  const hoverBg = styles.g(0, 0.05);

  const showToolbar = !readOnly && (selected || hovered);

  return (
    <div
      {...attributes}
      className={blockClass}
      style={{
        outline: '2px solid ' + (selected ? '#07f' : 'transparent'),
        outlineOffset: 2,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div contentEditable={false}>
        {caption ? (
          <div className={captionClass} style={{color: captionColor}}>
            {caption}
          </div>
        ) : (
          <button
            type="button"
            className={stripButtonClass}
            title="Select table of contents"
            aria-label="Select table of contents"
            onMouseDown={selectBlock}
            style={{
              opacity: hovered || selected ? 1 : 0,
              pointerEvents: hovered || selected ? 'auto' : 'none',
              transition: 'opacity 0.15s ease',
            }}
          >
            <span className={stripBarClass} />
          </button>
        )}
        {numberedItems.length ? (
          <div className={listClass}>
            {numberedItems.map((item) => {
              const indent = Math.max(0, item.level - (hasTitle ? 0 : 1)) * 32;
              const fontSize = item.level === 0 ? '1.05em' : item.level <= 2 ? '0.95em' : '0.9em';
              const fontWeight = item.level === 0 ? 600 : item.level === 1 ? 500 : 400;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={itemClass}
                  onMouseDown={preventMouseDown}
                  onClick={onItemClick(item)}
                  style={{
                    paddingInlineStart: indent + 8,
                    color: linkColor,
                    fontSize,
                    fontWeight,
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'start',
                    font: 'inherit',
                    width: '100%',
                  }}
                  data-toc-level={item.level}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = String(hoverBg);
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  {item.number ? (
                    <span style={{color: numberColor, marginInlineEnd: 6, fontVariantNumeric: 'tabular-nums'}}>
                      {item.number}
                    </span>
                  ) : null}
                  <span className={itemTitleClass}>{item.title}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={emptyClass} style={{color: captionColor}}>
            Add headings to populate the table of contents.
          </div>
        )}
      </div>
      {!readOnly && (
        <div
          contentEditable={false}
          className={moreWrapClass}
          onMouseDown={preventMouseDown}
          style={{opacity: showToolbar ? 1 : 0, pointerEvents: showToolbar ? 'auto' : 'none'}}
        >
          <ToolbarMenu
            menu={tocMenu}
            compact
            pane={{compact: true, lite: true}}
          />
        </div>
      )}
      {children}
    </div>
  );
};
