import * as rsync from './rsync';

export type WindowSizeState = [width: number, height: number];

class WindowSizeValue extends rsync.ReactValue<WindowSizeState> {
  private onResize = () => {
    const next: WindowSizeState = [window.innerWidth, window.innerHeight];
    const prev = this.value;
    if (prev[0] !== next[0] || prev[1] !== next[1]) this.next(next);
  };

  constructor(value: WindowSizeState) {
    super(typeof window === 'object' ? [window.innerWidth, window.innerHeight] : value);
    if (typeof window === 'object') {
      window.addEventListener('resize', this.onResize);
    }
  }

  public dispose(): void {
    if (typeof window === 'object') {
      window.removeEventListener('resize', this.onResize);
    }
  }
}

export const windowSize = (def: WindowSizeState = [0, 0]) =>
  new WindowSizeValue(def);
