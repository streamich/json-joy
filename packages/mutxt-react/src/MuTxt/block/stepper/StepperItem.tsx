import * as React from 'react';
import {rule} from 'nano-theme';
import {Editor, Element as SlateElement, type Path} from 'slate';
import {ReactEditor, useReadOnly, useSlateStatic, type RenderElementProps} from 'slate-react';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {PopupControlled} from '@jsonjoy.com/ui/lib/4-card/Popup/PopupControlled';
import {context as popupCtx} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {anchorContext, useAnchorPointHandle} from '@jsonjoy.com/ui/lib/utils/popup';
import {useLockScrolling} from '@jsonjoy.com/ui/lib/hooks/useLockScrolling';
import {useSingletonPopup} from '@jsonjoy.com/ui/lib/hooks/useSingletonPopup';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Scrollbox} from '@jsonjoy.com/ui/lib/4-card/Scrollbox';
import {Bullet} from './Bullet';
import {BulletOptions} from './BulletOptions';
import {Connector} from './Connector';
import {StepBody, stepHoverStripBarClass} from './StepBody';
import {getStepStateColors, pickGlyphColor} from './colors';
import {
  DEF_HALO,
  DEF_HALO_WIDTH,
  DEF_LINE,
  DEF_LINE_WIDTH,
  DEF_RING,
  DEF_RING_WIDTH,
  INDICATOR_SIZE,
  ITEM_GAP,
  getLineStyle,
  getStepIndicator,
  getStepState,
} from './settings';
import {fontFamilyOf} from '../../behavior/font';
import type {ListItemElement} from '../../types';

const itemClass = rule({
  pos: 'relative',
  listStyle: 'none',
  d: 'flex',
  fld: 'row',
  ai: 'stretch',
  gap: '12px',
  pad: `0 0 ${ITEM_GAP}px 0`,
  '&:last-child': {
    pad: '0',
  },
});

const indicatorColClass = rule({
  pos: 'relative',
  d: 'block',
  fls: '0 0 auto',
  w: `${INDICATOR_SIZE}px`,
  minH: `${INDICATOR_SIZE + 8}px`,
});

const triggerClass = rule({
  pos: 'relative',
  d: 'inline-block',
  pad: 0,
  bd: 'none',
  bg: 'transparent',
  cur: 'pointer',
  w: `${INDICATOR_SIZE}px`,
  h: `${INDICATOR_SIZE}px`,
  lh: '0',
});

export interface StepperItemProps extends RenderElementProps {
  element: ListItemElement;
}

const indexInParent = (path: Path): number => path[path.length - 1] ?? 0;

export const StepperItem: React.FC<StepperItemProps> = ({attributes, children, element}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const styles = useStyles();

  const popup = useSingletonPopup('stepper-bullet');
  const closePopup = React.useCallback(() => popup.setOpen(false), [popup]);
  const popupContextValue = React.useMemo(() => ({close: closePopup}), [closePopup]);
  const popupAnchorHandle = useAnchorPointHandle({
    horizontal: true,
    center: true,
    pinX: 'left',
    minSpace: 360,
    gap: 8,
  });
  useLockScrolling(popup.open);

  let index = 0;
  let isLast = false;
  try {
    const path = ReactEditor.findPath(editor, element);
    index = indexInParent(path);
    const [parent] = Editor.parent(editor, path);
    if (SlateElement.isElement(parent)) isLast = index === parent.children.length - 1;
  } catch {}

  const state = getStepState(element.stepState);
  const indicator = getStepIndicator(element.stepIndicator);
  const stateColors = getStepStateColors(styles, state);

  // Optional state hides the ring by default — the dashed-circle glyph
  // already reads as a ring, so a solid outline would visually compete.
  const stateRingDefault = state === 'optional' ? 'none' : DEF_RING;
  const ring = getLineStyle(element.ring, stateRingDefault);
  const ringColor = element.ringCol ?? stateColors.line;
  const ringWidth = element.ringWidth ?? DEF_RING_WIDTH;

  const halo = getLineStyle(element.halo, DEF_HALO);
  const haloColor = element.haloCol ?? stateColors.line;
  const haloWidth = element.haloWidth ?? DEF_HALO_WIDTH;

  const line = getLineStyle(element.line, DEF_LINE);
  const lineColor = element.lineCol ?? stateColors.line;
  const lineWidth = element.lineWidth ?? DEF_LINE_WIDTH;

  const bg = element.stepBg ?? stateColors.bg;
  const autoGlyph = element.stepBg ? pickGlyphColor(styles, bg, stateColors.glyph) : stateColors.glyph;
  const glyphColor = element.stepCol ?? autoGlyph;
  const haloDrawn = halo !== 'none' && haloWidth > 0;
  const connectorTop = INDICATOR_SIZE + (haloDrawn ? 10 : 4);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const bullet = (
    <Bullet
      state={state}
      indicator={indicator}
      chars={element.stepChar ?? ''}
      index={index}
      bg={bg}
      glyphColor={glyphColor}
      ring={ring}
      ringColor={ringColor}
      ringWidth={ringWidth}
      halo={halo}
      haloColor={haloColor}
      haloWidth={haloWidth}
    />
  );

  const ariaState =
    state === 'done'
      ? 'completed'
      : state === 'error'
        ? 'errored'
        : state === 'warning'
          ? 'warning'
          : state === 'optional'
            ? 'optional'
            : state === 'pending'
              ? 'pending'
              : 'active';

  return (
    <li
      {...attributes}
      className={`${itemClass} ${stepHoverStripBarClass}`}
      data-step-state={state}
      aria-current={state === 'active' ? 'step' : undefined}
      aria-label={`Step ${index + 1}, ${ariaState}`}
      style={{
        textAlign: element.align,
        fontFamily: fontFamilyOf(element.font),
        ['--mutxt-handle-color' as any]: styles.g(0.72),
        ['--mutxt-handle-color-hover' as any]: styles.g(0.35),
      }}
    >
      <span className={indicatorColClass} contentEditable={false}>
        {readOnly ? (
          <span className={triggerClass}>{bullet}</span>
        ) : (
          <popupCtx.Provider value={popupContextValue}>
            <anchorContext.Provider value={popupAnchorHandle}>
              <PopupControlled
                open={popup.open}
                refToggle={popupAnchorHandle.ref}
                onHeadClick={() => popup.setOpen(!popup.open)}
                onClickAway={closePopup}
                onEsc={popup.open ? closePopup : undefined}
                renderContext={() => (
                  <MoveToViewport vertical>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(100vh - 16px)',
                      }}
                    >
                      <Scrollbox shadow>
                        <div style={{padding: 16}}>
                          <BulletOptions element={element} />
                        </div>
                      </Scrollbox>
                    </div>
                  </MoveToViewport>
                )}
              >
                <button
                  type="button"
                  className={triggerClass}
                  aria-label={`Step ${index + 1} options, currently ${ariaState}`}
                  aria-haspopup="dialog"
                  aria-expanded={popup.open}
                  onMouseDown={preventMouseDown}
                >
                  {bullet}
                </button>
              </PopupControlled>
            </anchorContext.Provider>
          </popupCtx.Provider>
        )}
        {!isLast && (
          <Connector style={line} color={lineColor} width={lineWidth} top={connectorTop} />
        )}
      </span>
      <StepBody element={element} state={state}>
        {children}
      </StepBody>
    </li>
  );
};
