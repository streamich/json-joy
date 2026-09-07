import {rule} from 'nano-theme';
import * as React from 'react';
import {useClickAway} from '../../hooks/useClickAway';
import {PositionPopup} from '../../utils/popup/PositionPopup';
import type {RefPopupToggle} from '../../utils/popup/types';
import {BasicTooltip, type BasicTooltipProps} from '../BasicTooltip';

const blockClass = rule({
  d: 'flex',
  pos: 'relative',
});

const buttonClass = rule({
  d: 'inline-flex',
  ta: 'inherit',
  position: 'relative',
  bg: 'none',
  pad: 0,
  mar: 0,
  out: 0,
  trs: 'box-shadow .15s',
});

const roundClass = rule({
  bdrad: '50%',
});

export interface State {
  open: boolean;
  onEsc?: () => void;
}

export interface PopupControlledProps extends React.HTMLAttributes<any> {
  open?: boolean;
  round?: boolean;
  prerender?: boolean;
  block?: boolean;
  tooltip?: BasicTooltipProps;
  fadeIn?: boolean;
  renderContext: (state: State) => React.ReactNode;
  onHeadClick?: React.MouseEventHandler;
  onClickAway?: (e: Event) => void;
  onEsc?: () => void;
  refToggle?: RefPopupToggle;
}

export const PopupControlled: React.FC<PopupControlledProps> = (props) => {
  const {
    renderContext,
    children,
    round,
    open = false,
    prerender,
    tooltip,
    fadeIn,
    block,
    onHeadClick,
    onClickAway = () => {},
    onEsc,
    refToggle,
    ...rest
  } = props;

  const clickAwayRef = useClickAway(onClickAway);
  const wrapRef = React.useRef<HTMLElement | null>(null);
  const setWrapRef = React.useCallback(
    (el: HTMLSpanElement | null) => {
      wrapRef.current = el;
      clickAwayRef(el);
    },
    [clickAwayRef],
  );

  // Return focus to the trigger when the popup closes with focus lost
  const restoreRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (open) {
      restoreRef.current =
        wrapRef.current?.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? null;
      return;
    }
    const target = restoreRef.current;
    restoreRef.current = null;
    if (!target || !target.isConnected) return;
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body) target.focus();
    });
  }, [open]);

  // Document-level Escape fallback: the wrapper's onKeyDown only sees events
  // bubbling from focused descendants, so with focus outside the popup (e.g.
  // a blurred input) Escape would otherwise never reach it.
  React.useEffect(() => {
    if (!open || !onEsc) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      onEsc();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [open, onEsc]);

  const childrenWithTooltip = tooltip ? (
    <BasicTooltip {...tooltip} {...(open ? {renderTooltip: undefined} : null)}>
      {children}
    </BasicTooltip>
  ) : (
    children
  );

  const dropdown = (open || prerender) && (
    <PositionPopup fadeIn={fadeIn}>
      <span
        style={{
          visibility: open ? 'visible' : 'hidden',
        }}
      >
        {renderContext({open, onEsc})}
      </span>
    </PositionPopup>
  );

  const toggle = (
    // biome-ignore lint/a11y/useKeyWithClickEvents: popup toggle triggered via keyboard separately
    <span
      ref={refToggle}
      className={buttonClass + (round ? roundClass : '')}
      style={{display: block ? 'block' : undefined, width: block ? '100%' : undefined}}
      onClick={onHeadClick}
    >
      {childrenWithTooltip}
    </span>
  );

  return (
    <span
      {...rest}
      ref={setWrapRef}
      className={props.className + '' + blockClass}
      style={{display: block ? 'block' : undefined, width: block ? '100%' : undefined, ...(props.style || {})}}
      onKeyDown={
        !onEsc
          ? void 0
          : (e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                e.preventDefault();
                onEsc();
              }
            }
      }
    >
      {toggle}
      {dropdown}
    </span>
  );
};
