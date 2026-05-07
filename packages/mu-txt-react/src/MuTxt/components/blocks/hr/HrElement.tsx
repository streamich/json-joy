import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useFocused, useReadOnly, useSelected, type RenderElementProps} from 'slate-react';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {HrLine} from './HrLine';
import {HrOptionsPopup} from './HrOptionsPopup';
import * as settings from './settings';
import type {HrElement as HrElementType} from '../../../types';

const blockClass = rule({
  pos: 'relative',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bxz: 'border-box',
  us: 'none',
});

const innerClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  gap: '12px',
  w: '100%',
});

const textClass = rule({
  fz: '12px',
  lh: 1.4,
  maxW: '90%',
  ws: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

const moreWrapClass = rule({
  pos: 'absolute',
  t: '50%',
  r: '-32px',
  tr: 'translateY(-50%)',
  trs: 'opacity .2s',
});

export interface HrElementProps extends RenderElementProps {
  element: HrElementType;
}

export const HrElement: React.FC<HrElementProps> = ({attributes, children, element}) => {
  const theme = useTheme();
  const readOnly = useReadOnly();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const selected = isSelected && isFocused;

  const strokeWidth = settings.getHrStrokeWidth(element.strokeWidth);
  const lineWidth = settings.getHrLineWidth(element.lineWidth);
  const lineStyle = settings.getHrLineStyle(element.lineStyle);
  const blockHeight = settings.getHrBlockHeight(element.blockHeight);
  const caption = element.caption?.trim() ?? '';
  const lineColor = theme.g(0.7);
  const captionColor = theme.g(0.4);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div
      {...attributes}
      className={blockClass}
      style={{
        height: blockHeight,
        textAlign: element.align,
        outline: '2px solid ' + (selected ? '#07f' : 'transparent'),
        outlineOffset: 2,
        borderRadius: 4,
      }}
    >
      <div contentEditable={false} className={innerClass} style={{width: `${lineWidth}%`, color: lineColor}}>
        {caption ? (
          <>
            <HrLine strokeWidth={strokeWidth} style={lineStyle} />
            <span className={textClass} style={{color: captionColor}}>
              {caption}
            </span>
            <HrLine strokeWidth={strokeWidth} style={lineStyle} />
          </>
        ) : (
          <HrLine strokeWidth={strokeWidth} style={lineStyle} />
        )}
      </div>
      {!readOnly && (
        <span
          contentEditable={false}
          className={moreWrapClass}
          style={{opacity: selected ? 1 : 0, pointerEvents: selected ? 'auto' : 'none'}}
        >
          <Popup renderContext={() => <HrOptionsPopup element={element} />}>
            <BasicButtonMore
              type="button"
              width={24}
              height={24}
              rounder
              tooltip="Separator options"
              onMouseDown={preventMouseDown}
            />
          </Popup>
        </span>
      )}
      {children}
    </div>
  );
};
