import * as React from 'react';
import {AnchorPoint} from 'nice-ui/lib/utils/popup';
import {BehaviorSubject, Subscription, throttleTime} from 'rxjs';
import {resize$, rerender$} from '../util/rect$';
import {Portal} from './Portal';
import type {UiLifeCycles, Rect} from '../web';

export interface EntangledPortalStateOpts {
  anchor?: Partial<AnchorPoint>;
  dx?: number;
  dy?: number;
  onBase?: (el: HTMLSpanElement | null) => void; 
  onDest?: (el: HTMLElement | null) => void;
}

class EntangledPortalState implements UiLifeCycles {
  public baseEl: HTMLSpanElement | null = null;
  public destEl: HTMLElement | null = null;

  private baseSub: Subscription | undefined = void 0;
  private destSub: Subscription | undefined = void 0;

  public baseRect$: BehaviorSubject<Rect | undefined> = new BehaviorSubject<Rect | undefined>(void 0);

  constructor (public props: EntangledPortalProps) {}

  protected readonly entangle = (): void => {
    const {dx = 0, dy = 0, anchor} = this.props;
    const {baseRect$, destEl} = this;
    if (!destEl) return;
    const rect = this.baseRect$.getValue();
    if (!rect) return;
    const style = destEl.style;
    style.top = rect.y + 'px';
    style.left = rect.x + 'px';
  };
  
  public readonly base = (el: HTMLSpanElement | null) => {
    this.baseEl = el;
    this.baseSub?.unsubscribe();
    this.baseSub = void 0;
    if (el) {
      const baseRect$ = this.baseRect$;
      baseRect$.next(el.getBoundingClientRect());
      this.baseSub = rerender$(el).pipe(
        throttleTime(20, void 0, {trailing: true}),
      ).subscribe(() => {
        const rect = el.getBoundingClientRect();
        const oldRect = baseRect$.getValue();
        if (oldRect && rect.x === oldRect.x && rect.y === oldRect.y && rect.width === oldRect.width && rect.height === oldRect.height) return;
        baseRect$.next(rect);
      });
    } else this.baseRect$.next(void 0);
    this.props.onBase?.(el);
  };
  
  public readonly dest = (el: HTMLElement | null) => {
    this.destEl = el;
    this.destSub?.unsubscribe();
    this.destSub = void 0;
    if (el) {
      el.style.position = 'fixed';
      this.destSub = resize$(el).pipe(
        throttleTime(20, void 0, {trailing: true}),
      ).subscribe(this.entangle);
      this.entangle();
    }
    this.props.onDest?.(el);
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
  children?: React.ReactNode;
}

export const EntangledPortal: React.FC<EntangledPortalProps> = (props) => {
  const {dx = 0, dy = 0, anchor, children} = props;
  const state = React.useMemo(() => new EntangledPortalState({dx, dy, anchor}), []);
  state.props = props;
  React.useEffect(state.start, [state]);

  return (
    <span
      style={{width: 1, height: 1, display: 'inline-block', border: '1px solid red'}}
      ref={state.base}
    >
      <Portal>
        <div ref={state.dest}>
          {children}
        </div>
      </Portal>
    </span>
  );
};
