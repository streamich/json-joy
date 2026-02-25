import * as React from 'react';
import {rerender$, resize$} from '../../PeritextWebUi/util/rect$';
import {BehaviorSubject, type Subscription, throttleTime} from 'rxjs';
import {EditorPortal} from '../../PeritextWebUi/react/util/EditorPortal';
import type {Rect} from '../../PeritextWebUi/types';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

export interface EntangledPortalStateOpts {
  position?: (base: Rect, dest: Rect) => [x: number, y: number];
  onBase?: (el: HTMLSpanElement | null) => void;
  onDest?: (el: HTMLElement | null) => void;
}

class EntangledPortalState implements UiLifeCycles {
  public baseEl: HTMLSpanElement | null = null;
  public destEl: HTMLElement | null = null;

  private baseSub: Subscription | undefined = void 0;
  private destSub: Subscription | undefined = void 0;

  public baseRect$: BehaviorSubject<Rect | undefined> = new BehaviorSubject<Rect | undefined>(void 0);

  constructor(public opts: EntangledPortalProps) {}

  protected readonly entangle = (): void => {
    const {destEl, opts} = this;
    if (!destEl) return;
    const baseRect = this.baseRect$.getValue();
    if (!baseRect) return;
    let {x, y} = baseRect;
    const {position} = opts;
    if (position) [x, y] = position(baseRect, destEl.getBoundingClientRect());
    const style = destEl.style;
    style.left = x + 'px';
    style.top = y + 'px';
  };

  public readonly base = (el: HTMLSpanElement | null) => {
    this.baseEl = el;
    this.baseSub?.unsubscribe();
    this.baseSub = void 0;
    if (el) {
      const baseRect$ = this.baseRect$;
      baseRect$.next(el.getBoundingClientRect());
      this.baseSub = rerender$(el)
        .pipe(throttleTime(20, void 0, {trailing: true}))
        .subscribe(() => {
          const rect = el.getBoundingClientRect();
          const oldRect = baseRect$.getValue();
          if (
            oldRect &&
            rect.x === oldRect.x &&
            rect.y === oldRect.y &&
            rect.width === oldRect.width &&
            rect.height === oldRect.height
          )
            return;
          baseRect$.next(rect);
        });
    } else this.baseRect$.next(void 0);
    this.opts.onBase?.(el);
  };

  public readonly dest = (el: HTMLElement | null) => {
    this.destEl = el;
    this.destSub?.unsubscribe();
    this.destSub = void 0;
    if (el) {
      el.style.position = 'fixed';
      this.destSub = resize$(el)
        .pipe(throttleTime(20, void 0, {trailing: true}))
        .subscribe(this.entangle);
      this.entangle();
    }
    this.opts.onDest?.(el);
  };

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public readonly start = () => {
    const subscription = this.baseRect$.subscribe(() => {
      this.entangle();
    });
    return () => {
      subscription.unsubscribe();
      this.baseRect$.next(void 0);
      this.baseSub?.unsubscribe();
      this.baseSub = void 0;
    };
  };
}

export interface EntangledPortalProps extends EntangledPortalStateOpts {
  span?: React.HTMLAttributes<HTMLSpanElement>;
  children?: React.ReactNode;
}

/**
 * Renders a <span> with a <div> child rendered in a portal, such that the
 * <div> position is entangled with the <span> position, the <div> moves
 * with the <span> on resize and scroll.
 */
export const EntangledPortal: React.FC<EntangledPortalProps> = (props) => {
  const {span, children} = props;
  // biome-ignore lint: props are set on every re-render in the render body
  const state = React.useMemo(() => new EntangledPortalState(props), []);
  state.opts = props;
  // biome-ignore lint: too many dependencies
  React.useEffect(state.start, [state]);

  return (
    <span {...span} ref={state.base}>
      <EditorPortal>
        <div ref={state.dest}>{children}</div>
      </EditorPortal>
    </span>
  );
};
