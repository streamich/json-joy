import * as React from 'react';
import {Component, Children, cloneElement, createElement as h, type ReactNode, type MouseEvent} from 'react';
import {rule, useTheme} from 'nano-theme';

const noop = () => {};

const rippleClass = rule({
  bdrad: '50%',
  h: '100px',
  w: '100px',
  pos: 'absolute',
  transform: 'scale(0)',
  op: 1,
  pointerEvents: 'none',
  '@keyframes decor-ripple': {
    '100%': {
      transform: 'scale(12)',
      op: 0,
    },
  },
});

export interface RippleProps {
  color?: string;
  disabled?: boolean;
  ms?: number;
  children: ReactNode;
}

// eslint-disable-next-line
export type IRippleState = {};

class RippleImpl extends Component<RippleProps, IRippleState> {
  static defaultProps = {
    color: 'rgba(0,0,0,.2)',
    ms: 400,
  };

  el: HTMLElement | null = null;
  elRipple: HTMLDivElement | null = null;
  startAnimationTimer: ReturnType<typeof setTimeout> | null = null;
  clearAnimationTimer: ReturnType<typeof setTimeout> | null = null;

  ref = (originalRef: (el: HTMLDivElement) => void) => (el: HTMLDivElement) => {
    this.el = el;
    (originalRef || noop)(el);
  };

  refRipple = (el: HTMLDivElement) => {
    this.elRipple = el;
  };

  clearTimers = () => {
    if (this.startAnimationTimer) {
      clearTimeout(this.startAnimationTimer);
      this.startAnimationTimer = null;
    }
    if (this.clearAnimationTimer) {
      clearTimeout(this.clearAnimationTimer);
      this.clearAnimationTimer = null;
    }
  };

  clearAnimation = () => {
    if (!this.elRipple) return;
    this.elRipple.style.removeProperty('animation');
    this.clearAnimationTimer = null;
  };

  componentWillUnmount(): void {
    this.clearTimers();
    this.clearAnimation();
  }

  onMouseDown = (originalMouseDown: (ev: MouseEvent) => void) => (event: MouseEvent) => {
    if (this.props.disabled) return;
    if (!this.elRipple || !this.el) return;
    const {left, top} = this.el.getBoundingClientRect();
    const posX = left + window.scrollX;
    const posY = top + window.scrollY;
    const elX = event.pageX - posX;
    const elY = event.pageY - posY;
    const style = this.elRipple.style;
    this.clearTimers();
    style.removeProperty('animation');
    style.top = elY - 50 + 'px';
    style.left = elX - 50 + 'px';
    this.startAnimationTimer = setTimeout(() => {
      style.setProperty('animation', `decor-ripple ${this.props.ms}ms linear`);
      this.startAnimationTimer = null;
      this.clearAnimationTimer = setTimeout(this.clearAnimation, this.props.ms);
    }, 35);
    (originalMouseDown || noop)(event);
  };

  render() {
    const {children, color} = this.props;
    const element = Children.only(children) as React.ReactElement;
    const ripple = h('div', {
      className: rippleClass,
      style: {
        background: color,
      },
      ref: this.refRipple,
      onAnimationEnd: this.clearAnimation,
    });
    const p: any = typeof element.props === 'object' ? (element.props ?? {}) : {};

    let style = p.style || {};

    style = Object.assign({}, style, {
      overflow: 'hidden',
      position: 'relative',
    });

    const innerChildren = Children.toArray(p.children);

    return cloneElement(
      element,
      {
        ...p,
        style,
        ref: this.ref(p.ref),
        onMouseDown: this.onMouseDown(p.onMouseDown),
      },
      ...[ripple, ...innerChildren],
    );
  }
}

export const Ripple: React.FC<RippleProps> = (props) => {
  const theme = useTheme();
  const defaultColor = theme.isLight ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.18)';
  return h(RippleImpl, {...props, color: props.color ?? defaultColor});
};
